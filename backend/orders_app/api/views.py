from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.models import Profile

from ..models import Order
from .permissions import IsCustomerUser, IsOrderBusinessUser
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusSerializer,
)

ACTION_PERMISSIONS = {
    'create': [IsAuthenticated, IsCustomerUser],
    'update': [IsAuthenticated, IsOrderBusinessUser],
    'partial_update': [IsAuthenticated, IsOrderBusinessUser],
    'destroy': [IsAuthenticated, IsAdminUser],
}


class OrderViewSet(viewsets.ModelViewSet):
    """CRUD for the orders the requesting user is involved in."""

    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = None
    filter_backends = []

    def get_queryset(self):
        """Return only orders where the user is customer or business user."""
        user = self.request.user
        if self.action == 'destroy' and user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(
            Q(customer_user=user) | Q(business_user=user))

    def get_serializer_class(self):
        """Pick the serializer matching the current action."""
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action in ('update', 'partial_update'):
            return OrderStatusSerializer
        return OrderSerializer

    def get_permissions(self):
        """Resolve the permission classes for the current action."""
        classes = ACTION_PERMISSIONS.get(self.action, [IsAuthenticated])
        return [permission() for permission in classes]


class BaseOrderCountView(APIView):
    """Counts the orders of a business user filtered by a single status."""

    permission_classes = [IsAuthenticated]
    order_status = None
    response_key = None

    def get(self, request, business_user_id):
        """Return the number of matching orders for the given business user."""
        profile = get_object_or_404(
            Profile,
            user_id=business_user_id,
            type=Profile.ProfileType.BUSINESS,
        )
        count = Order.objects.filter(
            business_user=profile.user, status=self.order_status).count()
        return Response({self.response_key: count}, status=status.HTTP_200_OK)


class OrderCountView(BaseOrderCountView):
    """Counts the orders of a business user that are still in progress."""

    order_status = Order.OrderStatus.IN_PROGRESS
    response_key = 'order_count'


class CompletedOrderCountView(BaseOrderCountView):
    """Counts the completed orders of a business user."""

    order_status = Order.OrderStatus.COMPLETED
    response_key = 'completed_order_count'
