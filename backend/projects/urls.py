from .views import (
    AdminPendingProjectListView,
    ApproveProjectView,
    MyProjectListView,
    ProjectDetailView,
    ProjectListCreateView,
    RejectProjectView,
    SubmitProjectView,
)
from django.urls import include, path

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('mine/', MyProjectListView.as_view(), name='my-projects'),
    path('admin/pending/', AdminPendingProjectListView.as_view(), name='admin-pending-projects'),
    path('<int:project_id>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:project_id>/submit/', SubmitProjectView.as_view(), name='project-submit'),
    path('<int:project_id>/approve/', ApproveProjectView.as_view(), name='project-approve'),
    path('<int:project_id>/reject/', RejectProjectView.as_view(), name='project-reject'),
    path('', include('projects.admin_urls')),
]
