from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from auth_app.models import Profile
from auth_app.tests import create_user_with_profile

from .models import Review


class ReviewListTests(APITestCase):
    """Tests for listing, filtering and ordering reviews."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.other_business, _ = create_user_with_profile(
            'biz2', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        Review.objects.create(
            business_user=self.business, reviewer=self.customer, rating=4,
            description='Sehr professioneller Service.')
        Review.objects.create(
            business_user=self.other_business, reviewer=self.customer,
            rating=5, description='Top Qualität!')
        self.url = reverse('review-list')

    def test_anonymous_access_is_rejected(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_is_not_paginated(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_business_user_id(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            self.url, {'business_user_id': self.business.id})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['business_user'], self.business.id)

    def test_filter_by_reviewer_id(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            self.url, {'reviewer_id': self.customer.id})
        self.assertEqual(len(response.data), 2)

    def test_ordering_by_rating(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(self.url, {'ordering': 'rating'})
        ratings = [item['rating'] for item in response.data]
        self.assertEqual(ratings, sorted(ratings))


class ReviewCreateTests(APITestCase):
    """Tests for creating reviews."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        self.url = reverse('review-list')
        self.payload = {
            'business_user': self.business.id,
            'rating': 4,
            'description': 'Alles war toll!',
        }

    def test_customer_can_create_review(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reviewer'], self.customer.id)

    def test_business_user_cannot_create_review(self):
        self.client.force_authenticate(self.business)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_second_review_for_same_business_user_is_rejected(self):
        self.client.force_authenticate(self.customer)
        self.client.post(self.url, self.payload, format='json')
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_for_customer_profile_is_rejected(self):
        self.client.force_authenticate(self.customer)
        payload = {**self.payload, 'business_user': self.customer.id}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_above_five_is_rejected(self):
        self.client.force_authenticate(self.customer)
        payload = {**self.payload, 'rating': 6}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReviewUpdateDeleteTests(APITestCase):
    """Tests for updating and deleting reviews."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        self.stranger, _ = create_user_with_profile(
            'cust2', Profile.ProfileType.CUSTOMER)
        self.review = Review.objects.create(
            business_user=self.business, reviewer=self.customer, rating=4,
            description='Gut.')
        self.url = reverse('review-detail', kwargs={'pk': self.review.id})

    def test_reviewer_can_update_own_review(self):
        self.client.force_authenticate(self.customer)
        response = self.client.patch(
            self.url, {'rating': 5, 'description': 'Noch besser!'},
            format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 5)

    def test_other_user_cannot_update_review(self):
        self.client.force_authenticate(self.stranger)
        response = self.client.patch(
            self.url, {'rating': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_fields_are_rejected(self):
        self.client.force_authenticate(self.customer)
        response = self.client.patch(
            self.url, {'business_user': self.stranger.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reviewer_can_delete_own_review(self):
        self.client.force_authenticate(self.customer)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Review.objects.exists())

    def test_other_user_cannot_delete_review(self):
        self.client.force_authenticate(self.stranger)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unknown_review_returns_404(self):
        self.client.force_authenticate(self.customer)
        response = self.client.delete(
            reverse('review-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_str_contains_both_usernames(self):
        self.assertEqual(str(self.review), 'cust -> biz')
