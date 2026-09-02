from rest_framework import serializers

from auth_app.models import Profile

from ..models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Read and create representation of a review."""

    reviewer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'business_user', 'reviewer', 'rating', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_business_user(self, value):
        """Only business profiles can be reviewed."""
        profile = getattr(value, 'profile', None)
        if not profile or profile.type != Profile.ProfileType.BUSINESS:
            raise serializers.ValidationError(
                'Reviews can only be written for business users.')
        return value

    def validate(self, attrs):
        """Allow only one review per reviewer and business user."""
        business_user = attrs.get('business_user')
        reviewer = self.context['request'].user
        if Review.objects.filter(
                business_user=business_user, reviewer=reviewer).exists():
            raise serializers.ValidationError(
                {'business_user': 'You already reviewed this business user.'})
        return attrs

    def create(self, validated_data):
        """Attach the requesting user as the reviewer."""
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Updates a review, limited to the rating and the description."""

    class Meta:
        model = Review
        fields = [
            'id', 'business_user', 'reviewer', 'rating', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'business_user', 'reviewer', 'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        """Reject requests that try to change fields other than the review."""
        allowed = {'rating', 'description'}
        unexpected = set(self.initial_data) - allowed
        if unexpected:
            raise serializers.ValidationError(
                {field: 'This field cannot be updated.'
                 for field in unexpected})
        return attrs
