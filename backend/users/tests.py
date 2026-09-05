from .models import KYCVerification
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


def create_test_user(data):
    """Create user without password_confirm field."""
    user_data = {k: v for k, v in data.items() if k != 'password_confirm'}
    return User.objects.create_user(**user_data)


class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testinvestor',
            'email': 'investor@test.com',
            'first_name': 'Test',
            'last_name': 'Investor',
            'phone': '1234567890',
            'role': 'INVESTOR',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
        }
        self.project_owner_data = {
            'username': 'testowner',
            'email': 'owner@test.com',
            'first_name': 'Test',
            'last_name': 'Owner',
            'phone': '0987654321',
            'role': 'PROJECT_OWNER',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
        }

    def test_register_investor(self):
        response = self.client.post('/api/users/register/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'testinvestor')
        self.assertEqual(response.data['role'], 'INVESTOR')
        self.assertFalse(response.data['is_verified'])
        self.assertTrue(User.objects.filter(username='testinvestor').exists())

    def test_register_project_owner(self):
        response = self.client.post('/api/users/register/', self.project_owner_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'PROJECT_OWNER')

    def test_register_invalid_role(self):
        data = self.user_data.copy()
        data['role'] = 'ADMIN'
        response = self.client.post('/api/users/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        data = self.user_data.copy()
        data['password_confirm'] = 'different'
        response = self.client.post('/api/users/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_token(self):
        create_test_user(self.user_data)
        response = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        response = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'wrongpass',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_email(self):
        create_test_user(self.user_data)
        response = self.client.post(
            '/api/auth/token/',
            {
                'username': 'investor@test.com',
                'password': 'testpass123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_refresh(self):
        create_test_user(self.user_data)
        login_response = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        refresh_token = login_response.data['refresh']
        response = self.client.post(
            '/api/auth/token/refresh/',
            {
                'refresh': refresh_token,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_me_endpoint(self):
        create_test_user(self.user_data)
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testinvestor')

    def test_me_update(self):
        create_test_user(self.user_data)
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.patch('/api/users/me/', {'phone': '9999999999'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '9999999999')

    def test_me_unauthenticated(self):
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        create_test_user(self.user_data)
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.post(
            '/api/users/logout/', {'refresh': login.data['refresh']}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_kyc_submit(self):
        create_test_user(self.user_data)
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

        document = SimpleUploadedFile(
            'test_id.pdf', b'test document content', content_type='application/pdf'
        )
        response = self.client.post(
            '/api/users/kyc/', {'id_document': document}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')

    def test_kyc_submit_duplicate(self):
        user = create_test_user(self.user_data)
        KYCVerification.objects.create(user=user, id_document='kyc/documents/test.pdf')
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        document = SimpleUploadedFile('test_id.pdf', b'content', content_type='application/pdf')
        response = self.client.post(
            '/api/users/kyc/', {'id_document': document}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kyc_get_status(self):
        user = create_test_user(self.user_data)
        KYCVerification.objects.create(
            user=user, id_document='kyc/documents/test.pdf', status='APPROVED'
        )
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.get('/api/users/kyc/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'APPROVED')

    def test_kyc_review_admin(self):
        admin = User.objects.create_superuser('admin', 'admin@test.com', 'adminpass')
        admin.role = 'ADMIN'
        admin.save()
        user = create_test_user(self.user_data)
        KYCVerification.objects.create(user=user, id_document='kyc/documents/test.pdf')
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'admin',
                'password': 'adminpass',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.patch(
            f'/api/users/kyc/{user.kyc.id}/review/', {'status': 'APPROVED'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'APPROVED')

    def test_kyc_review_insurer(self):
        insurer = User.objects.create_user(
            username='insurer', email='insurer@test.com', password='pass', role='INSURER'
        )
        user = create_test_user(self.user_data)
        KYCVerification.objects.create(user=user, id_document='kyc/documents/test.pdf')
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'insurer',
                'password': 'pass',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.patch(
            f'/api/users/kyc/{user.kyc.id}/review/',
            {'status': 'REJECTED', 'rejection_reason': 'Invalid document'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'REJECTED')

    def test_kyc_review_forbidden(self):
        user = create_test_user(self.user_data)
        KYCVerification.objects.create(user=user, id_document='kyc/documents/test.pdf')
        login = self.client.post(
            '/api/auth/token/',
            {
                'username': 'testinvestor',
                'password': 'testpass123',
            },
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.patch(
            f'/api/users/kyc/{user.kyc.id}/review/', {'status': 'APPROVED'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AdminUserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@test.com', 'adminpass')
        self.admin.role = 'ADMIN'
        self.admin.save()
        self.investor = User.objects.create_user(
            'investor', 'inv@test.com', 'pass', role='INVESTOR'
        )

    def test_admin_user_list(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.get('/api/users/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_user_detail(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.get(f'/api/users/admin/users/{self.investor.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'investor')

    def test_admin_user_update(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.patch(
            f'/api/users/admin/users/{self.investor.id}/', {'phone': '1111111111'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '1111111111')

    def test_admin_user_delete(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.delete(f'/api/users/admin/users/{self.investor.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='investor').exists())

    def test_admin_user_delete_self_forbidden(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'admin', 'password': 'adminpass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.delete(f'/api/users/admin/users/{self.admin.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_user_forbidden_non_admin(self):
        login = self.client.post(
            '/api/auth/token/', {'username': 'investor', 'password': 'pass'}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.get('/api/users/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
