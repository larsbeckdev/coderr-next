from rest_framework import permissions

from auth_app.models import Profile


class IsCustomerUser(permissions.BasePermission):
    """Allow access only to authenticated users with a customer profile."""

    message = 'Only customer users are allowed to write reviews.'

    def has_permission(self, request, view):
        """Check the profile type of the requesting user."""
        profile = getattr(request.user, 'profile', None)
        return bool(
            profile and profile.type == Profile.ProfileType.CUSTOMER)


class IsReviewer(permissions.BasePermission):
    """Allow write access only to the author of the review."""

    message = 'You can only modify your own reviews.'

    def has_object_permission(self, request, view, obj):
        """Compare the review author with the requesting user."""
        return obj.reviewer == request.user
