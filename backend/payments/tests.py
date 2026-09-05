from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from investments.models import Investment
from notifications.models import Notification
from payments.models import Payment
from pools.models import Pool
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient
from transactions.models import Transaction
from users.models import KYCVerification

User = get_user_model()


class PaymentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', email='owner@test.com', password='pass', role='PROJECT_OWNER'
        )
        self.investor = User.objects.create_user(
            username='investor', email='inv@test.com', password='pass', role='INVESTOR'
        )

        KYCVerification.objects.create(
            user=self.investor, id_document='kyc/documents/test.pdf', status='APPROVED'
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
            investor=self.investor, pool=self.pool, amount=5000, status='PENDING'
        )

    def get_investor_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'investor', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_create_payment(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/payments/', {'investment_id': self.investment.id, 'method': 'CARD'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '5000.00')
        self.assertEqual(response.data['method'], 'CARD')
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertTrue(response.data['reference'].startswith('PAY-'))

    def test_create_payment_missing_investment_id(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/payments/', {'method': 'CARD'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_missing_method(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/payments/', {'investment_id': self.investment.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_invalid_investment(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/payments/', {'investment_id': 999, 'method': 'CARD'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_payment_not_pending(self):
        self.investment.status = 'CONFIRMED'
        self.investment.save()

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/payments/', {'investment_id': self.investment.id, 'method': 'CARD'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_duplicate(self):
        Payment.objects.create(
            investment=self.investment,
            user=self.investor,
            amount=5000,
            method='CARD',
            reference='PAY-TEST123',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/payments/', {'investment_id': self.investment.id, 'method': 'CARD'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_my_payments(self):
        Payment.objects.create(
            investment=self.investment,
            user=self.investor,
            amount=5000,
            method='CARD',
            reference='PAY-TEST123',
        )
        other_investment = Investment.objects.create(
            investor=self.investor, pool=self.pool, amount=3000, status='PENDING'
        )
        Payment.objects.create(
            investment=other_investment,
            user=self.investor,
            amount=3000,
            method='BANK_TRANSFER',
            reference='PAY-TEST456',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/payments/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_payment_detail(self):
        payment = Payment.objects.create(
            investment=self.investment,
            user=self.investor,
            amount=5000,
            method='CARD',
            reference='PAY-TEST123',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/payments/{payment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reference'], 'PAY-TEST123')

    def test_payment_detail_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        KYCVerification.objects.create(
            user=other, id_document='kyc/documents/test_other.pdf', status='APPROVED'
        )
        other_investment = Investment.objects.create(
            investor=other, pool=self.pool, amount=5000, status='PENDING'
        )
        payment = Payment.objects.create(
            investment=other_investment,
            user=other,
            amount=5000,
            method='CARD',
            reference='PAY-OTHER',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/payments/{payment.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_confirm_payment(self):
        payment = Payment.objects.create(
            investment=self.investment,
            user=self.investor,
            amount=5000,
            method='CARD',
            reference='PAY-TEST123',
            status='PENDING',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/payments/{payment.id}/confirm/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'SUCCESS')

        payment.refresh_from_db()
        self.assertEqual(payment.status, 'SUCCESS')

        self.investment.refresh_from_db()
        self.assertEqual(self.investment.status, 'CONFIRMED')

        # Check transaction created
        transaction = Transaction.objects.get(investment=self.investment)
        self.assertEqual(transaction.transaction_type, 'INVESTMENT')
        self.assertEqual(transaction.amount, 5000)
        self.assertEqual(transaction.status, 'COMPLETED')

        # Check notification created
        notification = Notification.objects.get(user=self.investor, notification_type='PAYMENT')
        self.assertEqual(notification.title, 'Paiement confirmé')

    def test_confirm_payment_already_confirmed(self):
        payment = Payment.objects.create(
            investment=self.investment,
            user=self.investor,
            amount=5000,
            method='CARD',
            reference='PAY-TEST123',
            status='SUCCESS',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/payments/{payment.id}/confirm/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_payment_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='INVESTOR')
        KYCVerification.objects.create(
            user=other, id_document='kyc/documents/test_other.pdf', status='APPROVED'
        )
        other_investment = Investment.objects.create(
            investor=other, pool=self.pool, amount=5000, status='PENDING'
        )
        payment = Payment.objects.create(
            investment=other_investment,
            user=other,
            amount=5000,
            method='CARD',
            reference='PAY-OTHER',
            status='PENDING',
        )

        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/payments/{payment.id}/confirm/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
