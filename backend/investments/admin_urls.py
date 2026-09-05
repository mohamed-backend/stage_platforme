from .admin_views import AdminInvestmentDetailView, AdminInvestmentListView
from django.urls import path

urlpatterns = [
    path('admin/investments/', AdminInvestmentListView.as_view(), name='admin-investment-list'),
    path(
        'admin/investments/<int:investment_id>/',
        AdminInvestmentDetailView.as_view(),
        name='admin-investment-detail',
    ),
]
