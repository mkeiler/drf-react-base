import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Project(models.Model):
    """
    Project model representing a project with team members.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        related_name='owned_projects',
        on_delete=models.CASCADE
    )
    members = models.ManyToManyField(
        User,
        related_name='projects',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def is_member(self, user):
        """Check if user is a member or owner of the project."""
        return user == self.owner or self.members.filter(id=user.id).exists()


class Sprint(models.Model):
    """
    Sprint model representing a time-boxed iteration within a project.
    """
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    project = models.ForeignKey(
        Project,
        related_name='sprints',
        on_delete=models.CASCADE
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planning'
    )
    goal = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.project.name} - {self.name}"

    def clean(self):
        """Validate sprint dates and active sprint constraints."""
        if self.end_date and self.start_date and self.end_date <= self.start_date:
            raise ValidationError('End date must be after start date.')

        # Check only one active sprint per project
        if self.status == 'active':
            active_sprints = Sprint.objects.filter(
                project=self.project,
                status='active'
            ).exclude(id=self.id)
            if active_sprints.exists():
                raise ValidationError('Only one active sprint allowed per project.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Check if sprint is currently active."""
        return self.status == 'active'

    def get_completion_percentage(self):
        """Calculate the percentage of completed tasks in this sprint."""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status='deployed').count()
        return int((completed_tasks / total_tasks) * 100)


class Task(models.Model):
    """
    Task model representing a work item in a project.
    """
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('implementing', 'Implementing'),
        ('testing', 'Testing'),
        ('deployed', 'Deployed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    project = models.ForeignKey(
        Project,
        related_name='tasks',
        on_delete=models.CASCADE
    )
    sprint = models.ForeignKey(
        Sprint,
        related_name='tasks',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    assigned_to = models.ForeignKey(
        User,
        related_name='assigned_tasks',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    created_by = models.ForeignKey(
        User,
        related_name='created_tasks',
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='backlog'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    story_points = models.IntegerField(null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    """
    Comment model for task discussions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        related_name='comments',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        related_name='comments',
        on_delete=models.CASCADE
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.email} on {self.task.title}: {self.text[:50]}"
