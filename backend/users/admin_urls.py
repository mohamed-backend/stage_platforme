from .admin_views import (
    AdminStatsView,
    AdminUserDetailView,
    AdminUserListView,
)
from django.urls import path

urlpatterns = [
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
