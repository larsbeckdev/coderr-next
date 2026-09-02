from rest_framework import permissions


class IsProfileOwner(permissions.BasePermission):
    """Read access for authenticated users, write access for owners."""

    message = 'You can only edit your own profile.'

    def has_object_permission(self, request, view, obj):
        """Grant write access only if the profile belongs to the requester."""
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
