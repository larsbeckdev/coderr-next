from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Profile
from .permissions import IsProfileOwner
from .serializers import (
    BusinessProfileSerializer,
    CustomerProfileSerializer,
    LoginSerializer,
    ProfileSerializer,
    RegistrationSerializer,
)


def build_auth_response(user):
    """Return the token payload the frontend stores after a successful auth."""
    token, _ = Token.objects.get_or_create(user=user)
    return {
        'token': token.key,
        'username': user.username,
        'email': user.email,
        'user_id': user.id,
    }


class RegistrationView(APIView):
    """Creates a new customer or business account."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Register a user and return its authentication token."""
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            build_auth_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Authenticates an existing user."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Validate credentials and return the authentication token."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response(build_auth_response(user), status=status.HTTP_200_OK)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """Reads and updates a single profile addressed by its user id."""

    queryset = Profile.objects.select_related('user')
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsProfileOwner]
    lookup_field = 'user_id'
    lookup_url_kwarg = 'pk'
    http_method_names = ['get', 'patch', 'head', 'options']


class BaseProfileListView(generics.ListAPIView):
    """Lists all profiles of a single profile type."""

    permission_classes = [IsAuthenticated]
    profile_type = None

    def get_queryset(self):
        """Return the profiles matching the configured profile type."""
        return Profile.objects.select_related('user').filter(
            type=self.profile_type)


class BusinessProfileListView(BaseProfileListView):
    """Lists every business profile on the platform."""

    serializer_class = BusinessProfileSerializer
    profile_type = Profile.ProfileType.BUSINESS


class CustomerProfileListView(BaseProfileListView):
    """Lists every customer profile on the platform."""

    serializer_class = CustomerProfileSerializer
    profile_type = Profile.ProfileType.CUSTOMER
