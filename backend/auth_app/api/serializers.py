from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from ..models import Profile


class RegistrationSerializer(serializers.ModelSerializer):
    """Validates sign up data and creates a user together with its profile."""

    repeated_password = serializers.CharField(write_only=True)
    type = serializers.ChoiceField(choices=Profile.ProfileType.choices)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'repeated_password', 'type']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        """Reject an email address that is already taken."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'This email address is already in use.')
        return value

    def validate(self, attrs):
        """Make sure both password fields match."""
        if attrs['password'] != attrs['repeated_password']:
            raise serializers.ValidationError(
                {'repeated_password': 'The passwords do not match.'})
        return attrs

    def create(self, validated_data):
        """Create the user and the matching profile in one step."""
        validated_data.pop('repeated_password')
        profile_type = validated_data.pop('type')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, type=profile_type)
        return user


class LoginSerializer(serializers.Serializer):
    """Validates credentials and exposes the authenticated user."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Authenticate the given credentials."""
        user = authenticate(
            username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError(
                {'detail': 'Invalid username or password.'})
        attrs['user'] = user
        return attrs


class BaseProfileSerializer(serializers.ModelSerializer):
    """Shared field definitions for every profile serializer.

    The text fields are declared as ``NOT NULL`` with an empty string default
    on the model, so the API never answers with ``null`` for them.
    """

    user = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(
        source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(
        source='user.last_name', required=False, allow_blank=True)


class ProfileSerializer(BaseProfileSerializer):
    """Full profile representation used for detail and update requests."""

    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = [
            'user', 'username', 'first_name', 'last_name', 'file', 'location',
            'tel', 'description', 'working_hours', 'type', 'email',
            'created_at',
        ]
        read_only_fields = ['type', 'created_at']

    def update(self, instance, validated_data):
        """Apply updates to the profile and its related user account."""
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        return super().update(instance, validated_data)


class BusinessProfileSerializer(BaseProfileSerializer):
    """List representation of a business profile."""

    class Meta:
        model = Profile
        fields = [
            'user', 'username', 'first_name', 'last_name', 'file', 'location',
            'tel', 'description', 'working_hours', 'type',
        ]


class CustomerProfileSerializer(BaseProfileSerializer):
    """List representation of a customer profile."""

    class Meta:
        model = Profile
        fields = [
            'user', 'username', 'first_name', 'last_name', 'file',
            'uploaded_at', 'type',
        ]
