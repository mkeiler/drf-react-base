from django.contrib import admin
from .models import Project, Sprint, Task, Comment


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description', 'owner__email']
    filter_horizontal = ['members']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'project', 'start_date']
    search_fields = ['name', 'project__name', 'goal']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'sprint', 'status', 'priority', 'assigned_to', 'created_by']
    list_filter = ['status', 'priority', 'project', 'sprint']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_select_related = ['project', 'sprint', 'assigned_to', 'created_by']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'created_at', 'text_preview']
    list_filter = ['created_at']
    search_fields = ['text', 'task__title', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_select_related = ['task', 'user']

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text Preview'
