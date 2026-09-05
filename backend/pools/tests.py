from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from pools.models import Pool
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class PoolAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', email='owner@test.com', password='pass', role='PROJECT_OWNER'
        )
        self.investor = User.objects.create_user(
            username='investor', email='inv@test.com', password='pass', role='INVESTOR'
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

        self.pool_data = {
            'project': self.project.id,
            'target_amount': '100000.00',
            'minimum_investment': '1000.00',
            'start_date': (timezone.now() + timedelta(hours=1)).isoformat(),
            'end_date': (timezone.now() + timedelta(days=30)).isoformat(),
        }

    def get_owner_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'owner', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def get_investor_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'investor', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_list_open_pools(self):
        Pool.objects.create(
            project=self.project,
            target_amount=100000,
            minimum_investment=1000,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='OPEN',
        )
        # Create a second project for the second pool
        other_owner = User.objects.create_user(
            'other_owner', 'other@test.com', 'pass', role='PROJECT_OWNER'
        )
        other_project = Project.objects.create(
            owner=other_owner,
            title='Other',
            description='d',
            risk_type='t',
            target_amount=50000,
            duration_months=6,
            status='PUBLISHED',
        )
        Pool.objects.create(
            project=other_project,
            target_amount=50000,
            minimum_investment=500,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='CLOSED',
        )
        response = self.client.get('/api/pools/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_pool_detail(self):
        pool = Pool.objects.create(
            project=self.project,
            target_amount=100000,
            minimum_investment=1000,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='OPEN',
        )
        response = self.client.get(f'/api/pools/{pool.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['target_amount'], '100000.00')
        self.assertEqual(response.data['remaining_amount'], '100000.00')

    def test_pool_detail_not_found(self):
        response = self.client.get('/api/pools/999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_pool_as_owner(self):
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/pools/create/', self.pool_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['target_amount'], '100000.00')
        self.assertEqual(response.data['status'], 'OPEN')
        self.assertEqual(Pool.objects.count(), 1)

    def test_create_pool_forbidden_investor(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/pools/create/', self.pool_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_pool_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='PROJECT_OWNER')
        project = Project.objects.create(
            owner=other,
            title='Other',
            description='d',
            risk_type='t',
            target_amount=10000,
            duration_months=6,
            status='PUBLISHED',
        )
        data = self.pool_data.copy()
        data['project'] = project.id
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/pools/create/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_pool_project_not_published(self):
        project = Project.objects.create(
            owner=self.owner,
            title='Draft',
            description='d',
            risk_type='t',
            target_amount=10000,
            duration_months=6,
            status='DRAFT',
        )
        data = self.pool_data.copy()
        data['project'] = project.id
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/pools/create/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_pool_duplicate(self):
        Pool.objects.create(
            project=self.project,
            target_amount=100000,
            minimum_investment=1000,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='OPEN',
        )
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/pools/create/', self.pool_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pool_properties(self):
        pool = Pool.objects.create(
            project=self.project,
            target_amount=100000,
            collected_amount=30000,
            minimum_investment=1000,
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=30),
            status='OPEN',
        )
        self.assertEqual(pool.remaining_amount, 70000)
        self.assertEqual(pool.funding_percentage, 30.0)
