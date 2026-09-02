from rest_framework import serializers
from rest_framework.exceptions import NotFound

from offers_app.models import OfferDetail

from ..models import Order

ORDER_FIELDS = [
    'id', 'customer_user', 'business_user', 'title', 'revisions',
    'delivery_time_in_days', 'price', 'features', 'offer_type', 'status',
    'created_at', 'updated_at',
]


class OrderSerializer(serializers.ModelSerializer):
    """Read representation of an order."""

    class Meta:
        model = Order
        fields = ORDER_FIELDS
        read_only_fields = ORDER_FIELDS


class OrderCreateSerializer(serializers.ModelSerializer):
    """Creates an order from an existing offer detail."""

    offer_detail_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ORDER_FIELDS + ['offer_detail_id']
        read_only_fields = ORDER_FIELDS

    def validate_offer_detail_id(self, value):
        """Make sure the referenced offer detail exists."""
        if not OfferDetail.objects.filter(pk=value).exists():
            raise NotFound('The given offer detail does not exist.')
        return value

    def create(self, validated_data):
        """Copy the offer detail data into a new order."""
        detail = OfferDetail.objects.select_related('offer').get(
            pk=validated_data['offer_detail_id'])
        return Order.objects.create(
            customer_user=self.context['request'].user,
            business_user=detail.offer.user,
            title=detail.title,
            revisions=detail.revisions,
            delivery_time_in_days=detail.delivery_time_in_days,
            price=detail.price,
            features=detail.features,
            offer_type=detail.offer_type,
        )


class OrderStatusSerializer(serializers.ModelSerializer):
    """Updates the status of an order and rejects any other field."""

    class Meta:
        model = Order
        fields = ORDER_FIELDS
        read_only_fields = [
            field for field in ORDER_FIELDS if field != 'status'
        ]

    def validate(self, attrs):
        """Reject requests that try to change fields other than the status."""
        unexpected = set(self.initial_data) - {'status'}
        if unexpected:
            raise serializers.ValidationError(
                {field: 'This field cannot be updated.'
                 for field in unexpected})
        return attrs
