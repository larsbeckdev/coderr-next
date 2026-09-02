from rest_framework import permissions

from auth_app.models import Profile


class IsBusinessUser(permissions.BasePermission):
    """Allow access only to authenticated users with a business profile."""

    message = 'Only business users are allowed to perform this action.'

    def has_permission(self, request, view):
        """Check the profile type of the requesting user."""
        profile = getattr(request.user, 'profile', None)
        return bool(
            profile and profile.type == Profile.ProfileType.BUSINESS)


class IsOfferOwner(permissions.BasePermission):
    """Allow write access only to the business user who created the offer."""

    message = 'You can only modify your own offers.'

    def has_object_permission(self, request, view, obj):
        """Compare the offer owner with the requesting user."""
        return obj.user == request.user
