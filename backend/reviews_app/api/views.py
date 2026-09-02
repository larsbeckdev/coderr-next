from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from ..models import Review
from .permissions import IsCustomerUser, IsReviewer
from .serializers import ReviewSerializer, ReviewUpdateSerializer

ACTION_PERMISSIONS = {
    'create': [IsAuthenticated, IsCustomerUser],
    'update': [IsAuthenticated, IsReviewer],
    'partial_update': [IsAuthenticated, IsReviewer],
    'destroy': [IsAuthenticated, IsReviewer],
}


class ReviewViewSet(viewsets.ModelViewSet):
    """CRUD for reviews written by customers about business users."""

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'business_user': ['exact'],
        'reviewer': ['exact'],
    }
    ordering_fields = ['updated_at', 'rating']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Apply the frontend specific ``*_id`` query parameters."""
        queryset = Review.objects.select_related('business_user', 'reviewer')
        params = self.request.query_params
        for param, field in (('business_user_id', 'business_user_id'),
                             ('reviewer_id', 'reviewer_id')):
            if params.get(param):
                queryset = queryset.filter(**{field: params[param]})
        return queryset

    def get_serializer_class(self):
        """Pick the serializer matching the current action."""
        if self.action in ('update', 'partial_update'):
            return ReviewUpdateSerializer
        return ReviewSerializer

    def get_permissions(self):
        """Resolve the permission classes for the current action."""
        classes = ACTION_PERMISSIONS.get(self.action, [IsAuthenticated])
        return [permission() for permission in classes]
