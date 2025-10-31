from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import models as django_models

from .models import Project, Sprint, Task, Comment
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer,
    SprintSerializer, SprintDetailSerializer,
    TaskSerializer, TaskDetailSerializer,
    CommentSerializer, UserSerializer
)
from .permissions import (
    IsProjectMember, IsProjectOwner,
    IsTaskCreatorOrAssignee, IsCommentOwner
)

User = get_user_model()


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return projects where user is owner or member."""
        user = self.request.user
        return Project.objects.filter(
            django_models.Q(owner=user) | django_models.Q(members=user)
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['update', 'partial_update', 'add_member', 'remove_member']:
            return [IsAuthenticated(), IsProjectOwner()]
        elif self.action == 'destroy':
            return [IsAuthenticated(), IsProjectOwner()]
        return [IsAuthenticated(), IsProjectMember()]

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project."""
        project = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response(
                {'message': f'User {user.email} added to project'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], url_path='remove-member/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        """Remove a member from the project."""
        project = self.get_object()

        try:
            user = User.objects.get(id=user_id)
            if user == project.owner:
                return Response(
                    {'error': 'Cannot remove project owner'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            project.members.remove(user)
            return Response(
                {'message': f'User {user.email} removed from project'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SprintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sprints.
    """
    permission_classes = [IsAuthenticated, IsProjectMember]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['status', 'project']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        """Return sprints for projects user has access to."""
        user = self.request.user
        queryset = Sprint.objects.filter(
            django_models.Q(project__owner=user) | django_models.Q(project__members=user)
        ).distinct()

        # Filter by project if provided in query params
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SprintDetailSerializer
        return SprintSerializer

    @action(detail=True, methods=['patch'])
    def set_active(self, request, pk=None):
        """Set sprint as active."""
        sprint = self.get_object()

        try:
            # Deactivate other sprints in the project
            Sprint.objects.filter(
                project=sprint.project,
                status='active'
            ).update(status='planning')

            # Activate this sprint
            sprint.status = 'active'
            sprint.save()

            serializer = self.get_serializer(sprint)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """Mark sprint as completed."""
        sprint = self.get_object()
        sprint.status = 'completed'
        sprint.save()

        # Move uncompleted tasks back to backlog
        sprint.tasks.exclude(status='deployed').update(sprint=None)

        serializer = self.get_serializer(sprint)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tasks.
    """
    permission_classes = [IsAuthenticated, IsProjectMember]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'description']
    filterset_fields = ['status', 'priority', 'sprint', 'assigned_to', 'project']
    ordering_fields = ['created_at', 'updated_at', 'order', 'priority']
    ordering = ['order', '-created_at']

    def get_queryset(self):
        """Return tasks for projects user has access to."""
        user = self.request.user
        queryset = Task.objects.filter(
            django_models.Q(project__owner=user) | django_models.Q(project__members=user)
        ).distinct()

        # Filter by project if provided
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Filter by sprint if provided
        sprint_id = self.request.query_params.get('sprint_id')
        if sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)

        # Filter backlog (tasks without sprint)
        if self.request.query_params.get('backlog') == 'true':
            queryset = queryset.filter(sprint__isnull=True)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TaskDetailSerializer
        return TaskSerializer

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """Move task to new status/position."""
        task = self.get_object()

        new_status = request.data.get('status')
        new_order = request.data.get('order')
        new_sprint = request.data.get('sprint')

        if new_status:
            task.status = new_status
        if new_order is not None:
            task.order = new_order
        if new_sprint is not None:
            task.sprint_id = new_sprint if new_sprint else None

        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentOwner]
    filter_backends = [filters.OrderingFilter]
    ordering = ['created_at']

    def get_queryset(self):
        """Return comments for tasks in projects user has access to."""
        user = self.request.user
        queryset = Comment.objects.filter(
            django_models.Q(task__project__owner=user) |
            django_models.Q(task__project__members=user)
        ).distinct()

        # Filter by task if provided
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_create(self, serializer):
        """Set the user when creating a comment."""
        serializer.save(user=self.request.user)
