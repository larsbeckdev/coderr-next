from rest_framework import permissions

from auth_app.models import Profile


class IsCustomerUser(permissions.BasePermission):
    """Allow access only to authenticated users with a customer profile."""

    message = 'Only customer users are allowed to create orders.'

    def has_permission(self, request, view):
        """Check the profile type of the requesting user."""
        profile = getattr(request.user, 'profile', None)
        return bool(
            profile and profile.type == Profile.ProfileType.CUSTOMER)


class IsOrderBusinessUser(permissions.BasePermission):
    """Allow status updates only to the business user of the order."""

    message = 'Only the assigned business user can update this order.'

    def has_object_permission(self, request, view, obj):
        """Compare the business user of the order with the requester."""
        return obj.business_user == request.user
