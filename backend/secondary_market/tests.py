from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from investments.models import Investment
from notifications.models import Notification
from pools.models import Pool
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient
from secondary_market.models import Listing
from users.models import KYCVerification

User = get_user_model()


class SecondaryMarketAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            username='seller', email='seller@test.com', password='pass', role='INVESTOR'
        )
        self.buyer = User.objects.create_user(
            username='buyer', email='buyer@test.com', password='pass', role='INVESTOR'
        )

        KYCVerification.objects.create(
            user=self.seller, id_document='kyc/documents/test_seller.pdf', status='APPROVED'
        )
        KYCVerification.objects.create(
            user=self.buyer, id_document='kyc/documents/test_buyer.pdf', status='APPROVED'
        )

        self.owner = User.objects.create_user(
            username='owner', email='owner@test.com', password='pass', role='PROJECT_OWNER'
        )

        self.project = Project.objects.create(
            owner=self.owner,
            title='Test Project',
            description='A test project',
            risk_type='Technology',
            target_amount=100000,
            duration_months=12,
            risk_level='MEDIUM',
            status='PUBLISHED',
        )

        self.pool = Pool.objects.create(
            project=self.project,
            target_amount=100000,
            minimum_investment=1000,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='OPEN',
        )

        self.investment = Investment.objects.create(
            investor=self.seller, pool=self.pool, amount=5000, status='CONFIRMED'
        )

    def get_seller_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'seller', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def get_buyer_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'buyer', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_create_listing(self):
        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/secondary-market/',
            {'investment_id': self.investment.id, 'price': '5500.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['price'], '5500.00')
        self.assertEqual(response.data['status'], 'ACTIVE')
        self.assertEqual(Listing.objects.count(), 1)

        # Check notification created
        notification = Notification.objects.get(user=self.seller, notification_type='MARKET')
        self.assertEqual(notification.title, 'Investissement mis en vente')

    def test_create_listing_missing_fields(self):
        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/secondary-market/', {'investment_id': self.investment.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_listing_not_confirmed(self):
        self.investment.status = 'PENDING'
        self.investment.save()

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/secondary-market/',
            {'investment_id': self.investment.id, 'price': '5500.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_listing_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        KYCVerification.objects.create(
            user=other, id_document='kyc/documents/test_other.pdf', status='APPROVED'
        )
        other_investment = Investment.objects.create(
            investor=other, pool=self.pool, amount=5000, status='CONFIRMED'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/secondary-market/',
            {'investment_id': other_investment.id, 'price': '5500.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_listing_duplicate(self):
        Listing.objects.create(
            seller=self.seller, investment=self.investment, price=5500, status='ACTIVE'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/secondary-market/',
            {'investment_id': self.investment.id, 'price': '6000.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_market(self):
        Listing.objects.create(
            seller=self.seller, investment=self.investment, price=5500, status='ACTIVE'
        )
        other_investment = Investment.objects.create(
            investor=self.buyer, pool=self.pool, amount=3000, status='CONFIRMED'
        )
        Listing.objects.create(
            seller=self.buyer, investment=other_investment, price=3200, status='ACTIVE'
        )
        # Create a second investment for the cancelled listing to avoid unique constraint
        cancelled_investment = Investment.objects.create(
            investor=self.seller, pool=self.pool, amount=2000, status='CONFIRMED'
        )
        Listing.objects.create(
            seller=self.seller, investment=cancelled_investment, price=4000, status='CANCELLED'
        )

        token = self.get_buyer_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/secondary-market/market/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see seller's listing, not own (buyer has no listing)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['price'], '5500.00')

    def test_list_my_listings(self):
        Listing.objects.create(
            seller=self.seller, investment=self.investment, price=5500, status='ACTIVE'
        )
        other_investment = Investment.objects.create(
            investor=self.seller, pool=self.pool, amount=3000, status='CONFIRMED'
        )
        Listing.objects.create(
            seller=self.seller, investment=other_investment, price=3200, status='ACTIVE'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/secondary-market/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_cancel_listing(self):
        listing = Listing.objects.create(
            seller=self.seller, investment=self.investment, price=5500, status='ACTIVE'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/secondary-market/{listing.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'CANCELLED')

        listing.refresh_from_db()
        self.assertEqual(listing.status, 'CANCELLED')

        # Check notification created
        notification = Notification.objects.get(
            user=self.seller, notification_type='MARKET', title='Annonce annulée'
        )
        self.assertIsNotNone(notification)

    def test_cancel_listing_not_active(self):
        listing = Listing.objects.create(
            seller=self.seller, investment=self.investment, price=5500, status='CANCELLED'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/secondary-market/{listing.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_listing_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        KYCVerification.objects.create(
            user=other, id_document='kyc/documents/test_other.pdf', status='APPROVED'
        )
        other_investment = Investment.objects.create(
            investor=other, pool=self.pool, amount=5000, status='CONFIRMED'
        )
        listing = Listing.objects.create(
            seller=other, investment=other_investment, price=5500, status='ACTIVE'
        )

        token = self.get_seller_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/secondary-market/{listing.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_listing_statuses(self):
        statuses = ['ACTIVE', 'SOLD', 'CANCELLED']
        for s in statuses:
            listing = Listing.objects.create(
                seller=self.seller,
                investment=Investment.objects.create(
                    investor=self.seller, pool=self.pool, amount=1000, status='CONFIRMED'
                ),
                price=1000,
                status=s,
            )
            self.assertEqual(listing.status, s)
