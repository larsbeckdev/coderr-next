from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import serializers

from ..models import Offer, OfferDetail

REQUIRED_OFFER_TYPES = {'basic', 'standard', 'premium'}


class OfferDetailSerializer(serializers.ModelSerializer):
    """Full representation of a single offer package."""

    class Meta:
        model = OfferDetail
        fields = [
            'id', 'title', 'revisions', 'delivery_time_in_days', 'price',
            'features', 'offer_type',
        ]


class OfferDetailLinkSerializer(serializers.ModelSerializer):
    """Compact representation that only links to the offer package."""

    url = serializers.SerializerMethodField()

    class Meta:
        model = OfferDetail
        fields = ['id', 'url']

    def get_url(self, obj):
        """Return the absolute URL of the offer detail endpoint."""
        path = reverse('offerdetail-detail', kwargs={'pk': obj.pk})
        request = self.context.get('request')
        return request.build_absolute_uri(path) if request else path


class OfferUserDetailsSerializer(serializers.ModelSerializer):
    """Name information about the business user owning an offer."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username']


class BaseOfferReadSerializer(serializers.ModelSerializer):
    """Shared read logic including the aggregated package values."""

    details = OfferDetailLinkSerializer(many=True, read_only=True)
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True)
    min_delivery_time = serializers.IntegerField(read_only=True)


class OfferListSerializer(BaseOfferReadSerializer):
    """Offer representation used in the paginated list endpoint."""

    user_details = OfferUserDetailsSerializer(source='user', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'user', 'title', 'image', 'description', 'created_at',
            'updated_at', 'details', 'min_price', 'min_delivery_time',
            'user_details',
        ]


class OfferRetrieveSerializer(BaseOfferReadSerializer):
    """Offer representation used in the single offer endpoint."""

    class Meta:
        model = Offer
        fields = [
            'id', 'user', 'title', 'image', 'description', 'created_at',
            'updated_at', 'details', 'min_price', 'min_delivery_time',
        ]


class OfferWriteSerializer(serializers.ModelSerializer):
    """Creates and updates an offer together with its packages."""

    details = OfferDetailSerializer(many=True)

    class Meta:
        model = Offer
        fields = ['id', 'title', 'image', 'description', 'details']

    def validate_details(self, value):
        """Require exactly one package per offer type when details are sent."""
        types = [item.get('offer_type') for item in value]
        if len(types) != len(set(types)):
            raise serializers.ValidationError(
                'Each offer type may only be sent once.')
        if not self.partial and set(types) != REQUIRED_OFFER_TYPES:
            raise serializers.ValidationError(
                'An offer needs exactly one basic, standard and premium '
                'package.')
        return value

    def create(self, validated_data):
        """Create the offer and all of its packages."""
        details_data = validated_data.pop('details', [])
        offer = Offer.objects.create(
            user=self.context['request'].user, **validated_data)
        for detail_data in details_data:
            OfferDetail.objects.create(offer=offer, **detail_data)
        return offer

    def update(self, instance, validated_data):
        """Update offer fields and the packages identified by offer type."""
        details_data = validated_data.pop('details', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        for detail_data in details_data:
            self.update_detail(instance, detail_data)
        return instance

    def update_detail(self, offer, detail_data):
        """Update a single package of the offer, matched by its offer type."""
        detail = offer.details.filter(
            offer_type=detail_data.get('offer_type')).first()
        if detail is None:
            raise serializers.ValidationError(
                {'details': 'Unknown offer type for this offer.'})
        for attr, value in detail_data.items():
            setattr(detail, attr, value)
        detail.save()

    def to_representation(self, instance):
        """Return the written offer with fully expanded packages."""
        data = super().to_representation(instance)
        data['details'] = OfferDetailSerializer(
            instance.details.all(), many=True).data
        return data
