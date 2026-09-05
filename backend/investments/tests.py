from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from investments.models import Investment
from pools.models import Pool
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient
from users.models import KYCVerification

User = get_user_model()


class InvestmentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', email='owner@test.com', password='pass', role='PROJECT_OWNER'
        )
        self.investor = User.objects.create_user(
            username='investor', email='inv@test.com', password='pass', role='INVESTOR'
        )
        self.investor_no_kyc = User.objects.create_user(
            username='investor2', email='inv2@test.com', password='pass', role='INVESTOR'
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

    def get_investor_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'investor', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def get_investor_no_kyc_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'investor2', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def get_owner_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'owner', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_create_investment_with_kyc_approved(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '5000.00')
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertEqual(Investment.objects.count(), 1)

    def test_create_investment_without_kyc(self):
        token = self.get_investor_no_kyc_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_investment_kyc_pending(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='PENDING'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_investment_forbidden_owner(self):
        KYCVerification.objects.create(
            user=self.owner, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_investment_below_minimum(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '500.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_investment_exceeds_remaining(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        self.pool.collected_amount = 95000
        self.pool.save()

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '10000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_investment_pool_closed(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        self.pool.status = 'CLOSED'
        self.pool.save()

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_my_investments(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        Investment.objects.create(
            investor=self.investor, pool=self.pool, amount=5000, status='PENDING'
        )
        Investment.objects.create(
            investor=self.investor, pool=self.pool, amount=3000, status='CONFIRMED'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/investments/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_investment_detail(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        investment = Investment.objects.create(
            investor=self.investor, pool=self.pool, amount=5000, status='PENDING'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/investments/{investment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], '5000.00')

    def test_investment_detail_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        KYCVerification.objects.create(
            user=other, id_document='kyc/documents/test_other.pdf', status='APPROVED'
        )
        investment = Investment.objects.create(
            investor=other, pool=self.pool, amount=5000, status='PENDING'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/investments/{investment.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_investment_updates_pool_collected(self):
        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/investments/', {'pool': self.pool.id, 'amount': '5000.00'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.pool.refresh_from_db()
        self.assertEqual(self.pool.collected_amount, 5000)
