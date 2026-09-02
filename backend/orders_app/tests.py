from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from auth_app.models import Profile
from auth_app.tests import create_user_with_profile
from offers_app.tests import create_offer

from .models import Order


def create_order(customer, business,
                 status_value=Order.OrderStatus.IN_PROGRESS):
    """Create an order between the given users."""
    return Order.objects.create(
        customer_user=customer,
        business_user=business,
        title='Logo Design',
        revisions=3,
        delivery_time_in_days=5,
        price=150,
        features=['Logo Design'],
        offer_type='basic',
        status=status_value,
    )


class OrderListCreateTests(APITestCase):
    """Tests for listing and creating orders."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        self.outsider, _ = create_user_with_profile(
            'other', Profile.ProfileType.CUSTOMER)
        self.offer = create_offer(self.business)
        self.url = reverse('order-list')

    def test_anonymous_access_is_rejected(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_returns_only_own_orders(self):
        create_order(self.customer, self.business)
        self.client.force_authenticate(self.outsider)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_list_is_not_paginated(self):
        create_order(self.customer, self.business)
        self.client.force_authenticate(self.customer)
        response = self.client.get(self.url)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)

    def test_customer_can_create_order_from_offer_detail(self):
        detail = self.offer.details.get(offer_type='basic')
        self.client.force_authenticate(self.customer)
        response = self.client.post(
            self.url, {'offer_detail_id': detail.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['business_user'], self.business.id)
        self.assertEqual(response.data['status'], 'in_progress')
        self.assertEqual(response.data['title'], detail.title)

    def test_business_user_cannot_create_order(self):
        detail = self.offer.details.get(offer_type='basic')
        self.client.force_authenticate(self.business)
        response = self.client.post(
            self.url, {'offer_detail_id': detail.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unknown_offer_detail_returns_404(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(
            self.url, {'offer_detail_id': 9999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_offer_detail_id_returns_400(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OrderUpdateDeleteTests(APITestCase):
    """Tests for updating the status and deleting orders."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        self.order = create_order(self.customer, self.business)
        self.url = reverse('order-detail', kwargs={'pk': self.order.id})
        self.admin = User.objects.create_superuser(
            username='admin', email='admin@example.com', password='pw12345')

    def test_business_user_can_update_status(self):
        self.client.force_authenticate(self.business)
        response = self.client.patch(
            self.url, {'status': 'completed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')

    def test_customer_cannot_update_status(self):
        self.client.force_authenticate(self.customer)
        response = self.client.patch(
            self.url, {'status': 'completed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_is_rejected(self):
        self.client.force_authenticate(self.business)
        response = self.client.patch(
            self.url, {'status': 'unknown'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_fields_are_rejected(self):
        self.client.force_authenticate(self.business)
        response = self.client.patch(
            self.url, {'title': 'Hack'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_order_returns_404(self):
        self.client.force_authenticate(self.business)
        response = self.client.patch(
            reverse('order-detail', kwargs={'pk': 9999}),
            {'status': 'completed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_can_delete_order(self):
        self.client.force_authenticate(self.admin)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_business_user_cannot_delete_order(self):
        self.client.force_authenticate(self.business)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class OrderCountTests(APITestCase):
    """Tests for the two business order counter endpoints."""

    def setUp(self):
        self.business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        self.customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        create_order(self.customer, self.business)
        create_order(
            self.customer, self.business, Order.OrderStatus.COMPLETED)

    def test_in_progress_count(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            reverse('order-count',
                    kwargs={'business_user_id': self.business.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'order_count': 1})

    def test_completed_count(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            reverse('completed-order-count',
                    kwargs={'business_user_id': self.business.id}))
        self.assertEqual(response.data, {'completed_order_count': 1})

    def test_unknown_business_user_returns_404(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            reverse('order-count', kwargs={'business_user_id': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_id_is_not_a_business_user(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(
            reverse('order-count',
                    kwargs={'business_user_id': self.customer.id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_anonymous_access_is_rejected(self):
        response = self.client.get(
            reverse('order-count',
                    kwargs={'business_user_id': self.business.id}))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderModelTests(APITestCase):
    """Tests for the order model helpers."""

    def test_str_contains_title_and_status(self):
        business, _ = create_user_with_profile(
            'biz', Profile.ProfileType.BUSINESS)
        customer, _ = create_user_with_profile(
            'cust', Profile.ProfileType.CUSTOMER)
        order = create_order(customer, business)
        self.assertEqual(str(order), 'Logo Design (in_progress)')
