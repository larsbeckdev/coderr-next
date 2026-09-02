from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from auth_app.models import Profile
from auth_app.tests import create_user_with_profile

from .models import Offer, OfferDetail


def build_details_payload(price=100, delivery=5):
    """Return a valid payload for the three required offer packages."""
    types = ['basic', 'standard', 'premium']
    return [
        {
            'title': f'{offer_type} package',
            'revisions': 2,
            'delivery_time_in_days': delivery + index,
            'price': price + index * 50,
            'features': ['Logo Design'],
            'offer_type': offer_type,
        }
        for index, offer_type in enumerate(types)
    ]


def create_offer(user, title='Website Design', price=100, delivery=5):
    """Create an offer with its three packages for the given user."""
    offer = Offer.objects.create(
        user=user, title=title, description='Some description')
    for detail in build_details_payload(price, delivery):
        OfferDetail.objects.create(offer=offer, **detail)
    return offer


class OfferListTests(APITestCase):
    """Tests for listing, filtering, searching and ordering offers."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.other, _ = create_user_with_profile(
            'biz2', Profile.ProfileType.BUSINESS)
        self.offer = create_offer(self.business, 'Website Design', 100, 5)
        self.cheap = create_offer(self.other, 'Logo Design', 50, 2)
        self.url = reverse('offer-list')

    def test_list_is_public_and_paginated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_contains_aggregated_values_and_detail_links(self):
        response = self.client.get(self.url)
        result = next(item for item in response.data['results']
                      if item['id'] == self.offer.id)
        self.assertEqual(float(result['min_price']), 100.0)
        self.assertEqual(result['min_delivery_time'], 5)
        self.assertEqual(len(result['details']), 3)
        self.assertIn('offerdetails', result['details'][0]['url'])

    def test_filter_by_creator_id(self):
        response = self.client.get(
            self.url, {'creator_id': self.business.id})
        self.assertEqual(response.data['count'], 1)

    def test_filter_by_min_price(self):
        response = self.client.get(self.url, {'min_price': 80})
        self.assertEqual(response.data['count'], 1)

    def test_filter_by_max_delivery_time(self):
        response = self.client.get(self.url, {'max_delivery_time': 3})
        self.assertEqual(response.data['count'], 1)

    def test_empty_filter_values_are_ignored(self):
        response = self.client.get(
            self.url,
            {'creator_id': '', 'search': '', 'ordering': '',
             'max_delivery_time': '', 'page': 1},
        )
        self.assertEqual(response.data['count'], 2)

    def test_search_matches_title(self):
        response = self.client.get(self.url, {'search': 'Logo'})
        self.assertEqual(response.data['count'], 1)

    def test_ordering_by_min_price(self):
        response = self.client.get(self.url, {'ordering': 'min_price'})
        prices = [float(item['min_price'])
                  for item in response.data['results']]
        self.assertEqual(prices, sorted(prices))


class OfferRetrieveTests(APITestCase):
    """Tests for reading a single offer and a single package."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.offer = create_offer(self.business)

    def test_anonymous_retrieve_is_rejected(self):
        response = self.client.get(
            reverse('offer-detail', kwargs={'pk': self.offer.id}))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_returns_offer_with_links(self):
        self.client.force_authenticate(self.business)
        response = self.client.get(
            reverse('offer-detail', kwargs={'pk': self.offer.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.business.id)
        self.assertNotIn('user_details', response.data)

    def test_retrieve_unknown_offer_returns_404(self):
        self.client.force_authenticate(self.business)
        response = self.client.get(
            reverse('offer-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_offerdetail_endpoint_returns_full_package(self):
        self.client.force_authenticate(self.business)
        detail = self.offer.details.first()
        response = self.client.get(
            reverse('offerdetail-detail', kwargs={'pk': detail.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['offer_type'], 'basic')

    def test_offerdetail_requires_authentication(self):
        detail = self.offer.details.first()
        response = self.client.get(
            reverse('offerdetail-detail', kwargs={'pk': detail.id}))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OfferCreateTests(APITestCase):
    """Tests for creating offers."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        self.url = reverse('offer-list')
        self.payload = {
            'title': 'Grafikdesign-Paket',
            'description': 'Ein umfassendes Paket.',
            'details': build_details_payload(),
        }

    def test_business_user_can_create_offer(self):
        self.client.force_authenticate(self.business)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['details']), 3)
        self.assertEqual(Offer.objects.get().user, self.business)

    def test_customer_user_cannot_create_offer(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_cannot_create_offer(self):
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_incomplete_details_are_rejected(self):
        self.client.force_authenticate(self.business)
        payload = {**self.payload, 'details': build_details_payload()[:2]}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_offer_types_are_rejected(self):
        self.client.force_authenticate(self.business)
        details = build_details_payload()
        details[1]['offer_type'] = 'basic'
        response = self.client.post(
            self.url, {**self.payload, 'details': details}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OfferUpdateDeleteTests(APITestCase):
    """Tests for updating and deleting offers."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.other, _ = create_user_with_profile(
            'biz2', Profile.ProfileType.BUSINESS)
        self.offer = create_offer(self.business)
        self.url = reverse('offer-detail', kwargs={'pk': self.offer.id})

    def test_owner_can_patch_offer_and_single_detail(self):
        self.client.force_authenticate(self.business)
        payload = {
            'title': 'Updated',
            'details': [{
                'title': 'Basic Updated',
                'revisions': 3,
                'delivery_time_in_days': 6,
                'price': 120,
                'features': ['Logo Design'],
                'offer_type': 'basic',
            }],
        }
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated')
        self.assertEqual(len(response.data['details']), 3)

    def test_patch_keeps_detail_ids_stable(self):
        self.client.force_authenticate(self.business)
        detail = self.offer.details.get(offer_type='basic')
        payload = {'details': [{
            'title': 'Basic Updated',
            'revisions': 3,
            'delivery_time_in_days': 6,
            'price': 120,
            'features': ['Logo'],
            'offer_type': 'basic',
        }]}
        self.client.patch(self.url, payload, format='json')
        detail.refresh_from_db()
        self.assertEqual(detail.title, 'Basic Updated')

    def test_patch_with_unknown_offer_type_is_rejected(self):
        self.client.force_authenticate(self.business)
        payload = {'details': [{
            'title': 'Ghost',
            'revisions': 1,
            'delivery_time_in_days': 1,
            'price': 1,
            'features': [],
            'offer_type': 'unknown',
        }]}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_with_missing_package_is_rejected(self):
        self.client.force_authenticate(self.business)
        self.offer.details.filter(offer_type='premium').delete()
        payload = {'details': [{
            'title': 'Premium',
            'revisions': 1,
            'delivery_time_in_days': 1,
            'price': 1,
            'features': [],
            'offer_type': 'premium',
        }]}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_business_user_cannot_patch_offer(self):
        self.client.force_authenticate(self.other)
        response = self.client.patch(
            self.url, {'title': 'Hack'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_delete_offer(self):
        self.client.force_authenticate(self.business)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Offer.objects.exists())

    def test_other_business_user_cannot_delete_offer(self):
        self.client.force_authenticate(self.other)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class OfferModelTests(APITestCase):
    """Tests for the offer model helpers."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.offer = create_offer(self.business, 'Website Design')

    def test_offer_str_returns_title(self):
        self.assertEqual(str(self.offer), 'Website Design')

    def test_offer_detail_str_contains_offer_and_type(self):
        detail = self.offer.details.get(offer_type='basic')
        self.assertEqual(str(detail), 'Website Design - basic')
