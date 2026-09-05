from django.contrib.auth import get_user_model
from django.test import TestCase
from notifications.models import Notification
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class NotificationAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@test.com', password='pass', role='INVESTOR'
        )
        self.other = User.objects.create_user(
            username='other', email='other@test.com', password='pass', role='INVESTOR'
        )

        self.notif1 = Notification.objects.create(
            user=self.user,
            notification_type='INVESTMENT',
            title='Investment created',
            message='Your investment was created',
            is_read=False,
        )
        self.notif2 = Notification.objects.create(
            user=self.user,
            notification_type='PAYMENT',
            title='Payment confirmed',
            message='Your payment was confirmed',
            is_read=True,
        )
        Notification.objects.create(
            user=self.other,
            notification_type='SYSTEM',
            title='System message',
            message='Welcome!',
            is_read=False,
        )

    def get_token(self):
        response = self.client.post(
            '/api/auth/token/', {'username': 'testuser', 'password': 'pass'}, format='json'
        )
        return response.data['access']

    def test_list_notifications(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = (
            response.data['results']
            if isinstance(response.data, dict) and 'results' in response.data
            else response.data
        )
        self.assertEqual(len(results), 2)

    def test_list_notifications_unauthenticated(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_notifications_only_own(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/notifications/')
        results = (
            response.data['results']
            if isinstance(response.data, dict) and 'results' in response.data
            else response.data
        )
        self.assertEqual(len(results), 2)
        for n in results:
            self.assertEqual(
                n['title'], 'Investment created' if not n['is_read'] else 'Payment confirmed'
            )

    def test_mark_notification_read(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/notifications/{self.notif1.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_read'])

        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_mark_notification_read_not_owner(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        other_notif = Notification.objects.get(user=self.other)
        response = self.client.post(f'/api/notifications/{other_notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_notification_read_already_read(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(f'/api/notifications/{self.notif2.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_read'])

    def test_mark_all_read(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/notifications/read-all/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
        self.notif2.refresh_from_db()
        self.assertTrue(self.notif2.is_read)

    def test_mark_all_read_no_unread(self):
        self.notif1.is_read = True
        self.notif1.save()

        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/notifications/read-all/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_notification_types(self):
        types = ['INVESTMENT', 'PAYMENT', 'TRANSACTION', 'MARKET', 'PROJECT', 'SYSTEM']
        for t in types:
            n = Notification.objects.create(
                user=self.user,
                notification_type=t,
                title=f'{t} notification',
                message=f'{t} message',
            )
            self.assertEqual(n.notification_type, t)

    def test_notification_ordering(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = (
            response.data['results']
            if isinstance(response.data, dict) and 'results' in response.data
            else response.data
        )
        # Should be ordered by created_at descending
        self.assertGreaterEqual(results[0]['created_at'], results[1]['created_at'])
