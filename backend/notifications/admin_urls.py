from .admin_views import AdminNotificationDetailView, AdminNotificationListView
from django.urls import path

urlpatterns = [
    path(
        'admin/notifications/', AdminNotificationListView.as_view(), name='admin-notification-list'
    ),
    path(
        'admin/notifications/<int:notification_id>/',
        AdminNotificationDetailView.as_view(),
        name='admin-notification-detail',
    ),
]
