from .admin_views import AdminClaimDetailView, AdminClaimListView
from django.urls import path

urlpatterns = [
    path('claims/', AdminClaimListView.as_view(), name='admin-claim-list'),
    path('claims/<int:claim_id>/', AdminClaimDetailView.as_view(), name='admin-claim-detail'),
]
