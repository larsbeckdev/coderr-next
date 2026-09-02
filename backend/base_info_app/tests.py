from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from auth_app.models import Profile
from auth_app.tests import create_user_with_profile
from offers_app.tests import create_offer
from reviews_app.models import Review


class BaseInfoTests(APITestCase):
    """Tests for the aggregated platform statistics endpoint."""

    def setUp(self):
        self.url = reverse('base-info')

    def test_empty_platform_returns_zero_values(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            'review_count': 0,
            'average_rating': 0.0,
            'business_profile_count': 0,
            'offer_count': 0,
        })

    def test_statistics_are_aggregated_and_rounded(self):
        business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        second, _ = create_user_with_profile(
            'cust2', Profile.ProfileType.CUSTOMER)
        create_offer(business)
        Review.objects.create(
            business_user=business, reviewer=customer, rating=4)
        Review.objects.create(
            business_user=business, reviewer=second, rating=5)

        response = self.client.get(self.url)
        self.assertEqual(response.data['review_count'], 2)
        self.assertEqual(response.data['average_rating'], 4.5)
        self.assertEqual(response.data['business_profile_count'], 1)
        self.assertEqual(response.data['offer_count'], 1)
