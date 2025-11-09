from rest_framework import permissions


class IsProjectMember(permissions.BasePermission):
    """
    Permission to check if user is a member or owner of the project.
    """
    def has_object_permission(self, request, view, obj):
        # Get the project from different object types
        if hasattr(obj, 'project'):
            project = obj.project
        elif hasattr(obj, 'task'):
            project = obj.task.project
        else:
            project = obj

        # Check if user is owner or member
        return project.is_member(request.user)


class IsProjectOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner of the project.
    """
    def has_object_permission(self, request, view, obj):
        # Get the project from different object types
        if hasattr(obj, 'project'):
            project = obj.project
        elif hasattr(obj, 'task'):
            project = obj.task.project
        else:
            project = obj

        return project.owner == request.user


class IsTaskCreatorOrAssignee(permissions.BasePermission):
    """
    Permission to check if user created the task or is assigned to it.
    Also allows project members to view tasks.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read access to all project members
        if request.method in permissions.SAFE_METHODS:
            return obj.project.is_member(request.user)

        # Allow edit/delete only for creator or assignee
        return (
            obj.created_by == request.user or
            obj.assigned_to == request.user or
            obj.project.owner == request.user
        )


class IsCommentOwner(permissions.BasePermission):
    """
    Permission to check if user owns the comment.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read access to project members
        if request.method in permissions.SAFE_METHODS:
            return obj.task.project.is_member(request.user)

        # Allow edit/delete only for comment owner
        return obj.user == request.user
