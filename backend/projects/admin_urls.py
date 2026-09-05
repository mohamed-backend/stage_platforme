from .admin_views import AdminProjectDetailView, AdminProjectListView
from django.urls import path

urlpatterns = [
    path('admin/projects/', AdminProjectListView.as_view(), name='admin-project-list'),
    path(
        'admin/projects/<int:project_id>/',
        AdminProjectDetailView.as_view(),
        name='admin-project-detail',
    ),
]
