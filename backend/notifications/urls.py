# notifications/urls.py

from .views import (
    NotificationListView,
    NotificationReadAllView,
    NotificationReadView,
)
from django.urls import include, path

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:notification_id>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('read-all/', NotificationReadAllView.as_view(), name='notification-read-all'),
    path('', include('notifications.admin_urls')),
]
