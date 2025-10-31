from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Sprint, Task, Comment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations."""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'email']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for task comments."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for tasks with basic information."""
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'sprint',
            'assigned_to', 'assigned_to_details', 'created_by',
            'created_by_details', 'status', 'priority', 'story_points',
            'order', 'created_at', 'updated_at', 'comments_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskDetailSerializer(TaskSerializer):
    """Detailed task serializer with comments."""
    comments = CommentSerializer(many=True, read_only=True)

    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['comments']


class SprintSerializer(serializers.ModelSerializer):
    """Serializer for sprints with basic information."""
    tasks_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Sprint
        fields = [
            'id', 'name', 'project', 'start_date', 'end_date',
            'status', 'goal', 'created_at', 'updated_at',
            'tasks_count', 'completed_tasks', 'completion_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='deployed').count()

    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()

    def validate(self, data):
        """Validate sprint dates."""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "End date must be after start date."
                )

        # Check for only one active sprint per project
        if data.get('status') == 'active':
            project = data.get('project') or self.instance.project
            active_sprints = Sprint.objects.filter(
                project=project,
                status='active'
            )
            if self.instance:
                active_sprints = active_sprints.exclude(id=self.instance.id)

            if active_sprints.exists():
                raise serializers.ValidationError(
                    "Only one active sprint allowed per project."
                )

        return data


class SprintDetailSerializer(SprintSerializer):
    """Detailed sprint serializer with tasks."""
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta(SprintSerializer.Meta):
        fields = SprintSerializer.Meta.fields + ['tasks']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for projects with basic information."""
    owner_details = UserSerializer(source='owner', read_only=True)
    members_count = serializers.SerializerMethodField()
    sprints_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    active_sprint = serializers.SerializerMethodField()
    tasks_by_status = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'owner', 'owner_details',
            'members', 'members_count', 'sprints_count', 'tasks_count',
            'active_sprint', 'tasks_by_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_sprints_count(self, obj):
        return obj.sprints.count()

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_active_sprint(self, obj):
        active_sprint = obj.sprints.filter(status='active').first()
        if active_sprint:
            return {
                'id': str(active_sprint.id),
                'name': active_sprint.name,
                'start_date': active_sprint.start_date,
                'end_date': active_sprint.end_date
            }
        return None

    def get_tasks_by_status(self, obj):
        return {
            'backlog': obj.tasks.filter(status='backlog').count(),
            'implementing': obj.tasks.filter(status='implementing').count(),
            'testing': obj.tasks.filter(status='testing').count(),
            'deployed': obj.tasks.filter(status='deployed').count(),
        }

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        validated_data['owner'] = self.context['request'].user
        project = Project.objects.create(**validated_data)
        project.members.set(members)
        # Automatically add owner as a member
        project.members.add(validated_data['owner'])
        return project


class ProjectDetailSerializer(ProjectSerializer):
    """Detailed project serializer with members list."""
    members_details = UserSerializer(source='members', many=True, read_only=True)
    sprints = SprintSerializer(many=True, read_only=True)

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members_details', 'sprints']
