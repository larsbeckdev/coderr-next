from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Profile


def create_user_with_profile(username, profile_type, **profile_fields):
    """Create a user plus profile and return both objects."""
    user = User.objects.create_user(
        username=username, email=f'{username}@example.com', password='pw12345')
    profile = Profile.objects.create(
        user=user, type=profile_type, **profile_fields)
    return user, profile


class RegistrationTests(APITestCase):
    """Tests for the registration endpoint."""

    def setUp(self):
        self.url = reverse('registration')
        self.payload = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'secret123',
            'repeated_password': 'secret123',
            'type': 'customer',
        }

    def test_registration_creates_user_and_profile(self):
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertTrue(Profile.objects.filter(user__username='newuser')
                        .exists())

    def test_registration_fails_with_mismatching_passwords(self):
        payload = {**self.payload, 'repeated_password': 'other'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_fails_with_duplicate_email(self):
        create_user_with_profile('taken', Profile.ProfileType.CUSTOMER)
        payload = {**self.payload, 'email': 'taken@example.com'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_fails_with_invalid_type(self):
        payload = {**self.payload, 'type': 'unknown'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.url = reverse('login')
        create_user_with_profile('kevin', Profile.ProfileType.BUSINESS)

    def test_login_returns_token(self):
        response = self.client.post(
            self.url, {'username': 'kevin', 'password': 'pw12345'},
            format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'kevin')
        self.assertTrue(Token.objects.filter(key=response.data['token'])
                        .exists())

    def test_login_fails_with_wrong_password(self):
        response = self.client.post(
            self.url, {'username': 'kevin', 'password': 'wrong'},
            format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileDetailTests(APITestCase):
    """Tests for reading and updating a single profile."""

    def setUp(self):
        self.owner, self.profile = create_user_with_profile(
            'max', Profile.ProfileType.BUSINESS, location='Berlin')
        self.other, _ = create_user_with_profile(
            'jane', Profile.ProfileType.CUSTOMER)
        self.url = reverse('profile-detail', kwargs={'pk': self.owner.id})

    def test_anonymous_access_is_rejected(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_can_read_profile(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.owner.id)
        for field in ('first_name', 'last_name', 'tel', 'description',
                      'working_hours'):
            self.assertEqual(response.data[field], '')

    def test_missing_profile_returns_404(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get(
            reverse('profile-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_can_update_profile(self):
        self.client.force_authenticate(self.owner)
        response = self.client.patch(
            self.url, {'first_name': 'Max', 'tel': '123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Max')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.first_name, 'Max')

    def test_other_user_cannot_update_profile(self):
        self.client.force_authenticate(self.other)
        response = self.client.patch(
            self.url, {'first_name': 'Hack'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProfileListTests(APITestCase):
    """Tests for the business and customer profile lists."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)

    def test_business_list_contains_only_business_profiles(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse('business-profile-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'business')

    def test_customer_list_contains_only_customer_profiles(self):
        self.client.force_authenticate(self.business)
        response = self.client.get(reverse('customer-profile-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'cust')

    def test_anonymous_list_access_is_rejected(self):
        response = self.client.get(reverse('business-profile-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileModelTests(APITestCase):
    """Tests for the profile model helpers."""

    def test_str_contains_username_and_type(self):
        _, profile = create_user_with_profile(
            'strtest', Profile.ProfileType.BUSINESS)
        self.assertEqual(str(profile), 'strtest (business)')


class GuestUserCommandTests(APITestCase):
    """Tests for the guest account management command."""

    def test_command_creates_both_guest_accounts_once(self):
        call_command('create_guest_users', stdout=StringIO())
        call_command('create_guest_users', stdout=StringIO())
        self.assertEqual(User.objects.filter(
            username__in=['andrey', 'kevin']).count(), 2)
        self.assertEqual(
            Profile.objects.get(user__username='kevin').type, 'business')
