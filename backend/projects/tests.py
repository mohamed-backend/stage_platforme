from django.contrib.auth import get_user_model
from django.test import TestCase
from projects.models import Project
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class ProjectAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', email='owner@test.com', password='pass', role='PROJECT_OWNER'
        )
        self.investor = User.objects.create_user(
            username='investor', email='inv@test.com', password='pass', role='INVESTOR'
        )
        self.admin = User.objects.create_superuser('admin', 'admin@test.com', 'adminpass')
        self.admin.role = 'ADMIN'
        self.admin.save()

        self.project_data = {
            'title': 'Test Project',
            'description': 'A test project for investment',
            'risk_type': 'Technology',
            'target_amount': '100000.00',
            'duration_months': 12,
            'risk_level': 'MEDIUM',
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

    def get_admin_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        return response.data['access']

    def test_create_project_as_owner(self):
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/projects/', self.project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Project')
        self.assertEqual(response.data['status'], 'DRAFT')
        self.assertEqual(response.data['owner'], self.owner.id)

    def test_create_project_forbidden_investor(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/projects/', self.project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_project_unauthenticated(self):
        response = self.client.post('/api/projects/', self.project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_published_projects(self):
        Project.objects.create(owner=self.owner, **self.project_data, status='PUBLISHED')
        Project.objects.create(
            owner=self.owner,
            title='Draft Project',
            description='d',
            risk_type='t',
            target_amount=1000,
            duration_months=6,
            status='DRAFT',
        )
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = (
            response.data['results']
            if isinstance(response.data, dict) and 'results' in response.data
            else response.data
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Test Project')

    def test_list_my_projects(self):
        Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        Project.objects.create(
            owner=self.owner,
            title='Published',
            description='d',
            risk_type='t',
            target_amount=1000,
            duration_months=6,
            status='PUBLISHED',
        )
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/projects/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_my_projects_forbidden_investor(self):
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/projects/mine/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_project_detail_published(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='PUBLISHED')
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Project')

    def test_project_detail_draft_owner(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_detail_draft_forbidden(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_investor_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_project_detail_admin(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_project_draft(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            f'/api/projects/{project.id}/', {'title': 'Updated Title'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_update_project_rejected(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='REJECTED')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            f'/api/projects/{project.id}/', {'title': 'Updated'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_project_published_forbidden(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='PUBLISHED')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            f'/api/projects/{project.id}/', {'title': 'Updated'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_project_not_owner(self):
        other = User.objects.create_user('other', 'other@test.com', 'pass', role='PROJECT_OWNER')
        project = Project.objects.create(owner=other, **self.project_data, status='DRAFT')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            f'/api/projects/{project.id}/', {'title': 'Updated'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submit_project(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/projects/{project.id}/submit/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.status, 'PENDING')

    def test_submit_project_not_draft_rejected(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='PUBLISHED')
        token = self.get_owner_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/projects/{project.id}/submit/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_list_pending(self):
        Project.objects.create(owner=self.owner, **self.project_data, status='PENDING')
        Project.objects.create(
            owner=self.owner,
            title='Pub',
            description='d',
            risk_type='t',
            target_amount=1000,
            duration_months=6,
            status='PUBLISHED',
        )
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/projects/admin/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_approve_project(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='PENDING')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/projects/{project.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.status, 'PUBLISHED')

    def test_admin_approve_not_pending(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/projects/{project.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_reject_project(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='PENDING')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/projects/{project.id}/reject/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.status, 'REJECTED')

    def test_admin_list_all(self):
        Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        Project.objects.create(
            owner=self.owner,
            title='Pub',
            description='d',
            risk_type='t',
            target_amount=1000,
            duration_months=6,
            status='PUBLISHED',
        )
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/projects/admin/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_project_detail(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(f'/api/projects/admin/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_project_update(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            f'/api/projects/admin/projects/{project.id}/', {'risk_level': 'HIGH'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['risk_level'], 'HIGH')

    def test_admin_project_delete(self):
        project = Project.objects.create(owner=self.owner, **self.project_data, status='DRAFT')
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.delete(f'/api/projects/admin/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=project.id).exists())
