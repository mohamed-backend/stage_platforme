from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from investments.models import Investment
from pools.models import Pool
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient
from transactions.models import Transaction

User = get_user_model()


class TransactionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.investor = User.objects.create_user(
            username='investor', email='inv@test.com', password='pass', role='INVESTOR'
        )

        from users.models import KYCVerification  # noqa: PLC0415

        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
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
            investor=self.investor, pool=self.pool, amount=5000, status='CONFIRMED'
        )

        self.transaction = Transaction.objects.create(
            user=self.investor,
            investment=self.investment,
            transaction_type='INVESTMENT',
            amount=5000,
            status='COMPLETED',
            reference='TXN-TEST123',
            description='Investment in Test Project',
        )

    def get_investor_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'investor', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_list_my_transactions(self):
        Transaction.objects.create(
            user=self.investor,
            transaction_type='DEPOSIT',
            amount=10000,
            status='COMPLETED',
            reference='TXN-TEST456',
            description='Wallet deposit',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/transactions/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = (
            response.data['results']
            if isinstance(response.data, dict) and 'results' in response.data
            else response.data
        )
        self.assertEqual(len(results), 2)

    def test_transaction_detail(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/transactions/{self.transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reference'], 'TXN-TEST123')
        self.assertEqual(response.data['transaction_type'], 'INVESTMENT')

    def test_transaction_detail_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        other_transaction = Transaction.objects.create(
            user=other,
            transaction_type='WITHDRAWAL',
            amount=2000,
            status='COMPLETED',
            reference='TXN-OTHER',
            description='Withdrawal',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/transactions/{other_transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_transaction_types(self):
        types = ['INVESTMENT', 'REFUND', 'WITHDRAWAL', 'DEPOSIT']
        for t in types:
            tx = Transaction.objects.create(
                user=self.investor,
                transaction_type=t,
                amount=1000,
                status='COMPLETED',
                reference=f'TXN-{t}',
                description=f'{t} transaction',
            )
            self.assertEqual(tx.transaction_type, t)

    def test_transaction_statuses(self):
        statuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
        for s in statuses:
            tx = Transaction.objects.create(
                user=self.investor,
                transaction_type='INVESTMENT',
                amount=1000,
                status=s,
                reference=f'TXN-{s}',
                description=f'{s} transaction',
            )
            self.assertEqual(tx.status, s)
