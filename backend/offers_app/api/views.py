from django.db.models import Min
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..models import Offer, OfferDetail
from .filters import OfferFilter
from .pagination import OfferPagination
from .permissions import IsBusinessUser, IsOfferOwner
from .serializers import (
    OfferDetailSerializer,
    OfferListSerializer,
    OfferRetrieveSerializer,
    OfferWriteSerializer,
)

ACTION_PERMISSIONS = {
    'list': [AllowAny],
    'retrieve': [IsAuthenticated],
    'create': [IsAuthenticated, IsBusinessUser],
}
OWNER_PERMISSIONS = [IsAuthenticated, IsOfferOwner]


class OfferViewSet(viewsets.ModelViewSet):
    """Full CRUD for offers including filtering, search and pagination."""

    queryset = Offer.objects.all()
    serializer_class = OfferListSerializer
    pagination_class = OfferPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = OfferFilter
    search_fields = ['title', 'description']
    ordering_fields = ['updated_at', 'min_price']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Annotate every offer with its lowest price and delivery time."""
        return Offer.objects.select_related('user').prefetch_related(
            'details',
        ).annotate(
            min_price=Min('details__price'),
            min_delivery_time=Min('details__delivery_time_in_days'),
        )

    def get_serializer_class(self):
        """Pick the serializer matching the current action."""
        if self.action == 'list':
            return OfferListSerializer
        if self.action == 'retrieve':
            return OfferRetrieveSerializer
        return OfferWriteSerializer

    def get_permissions(self):
        """Resolve the permission classes for the current action."""
        classes = ACTION_PERMISSIONS.get(self.action, OWNER_PERMISSIONS)
        return [permission() for permission in classes]


class OfferDetailRetrieveView(generics.RetrieveAPIView):
    """Reads a single offer package."""

    queryset = OfferDetail.objects.all()
    serializer_class = OfferDetailSerializer
    permission_classes = [IsAuthenticated]
