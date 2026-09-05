from .admin_views import AdminTransactionDetailView, AdminTransactionListView
from django.urls import path

urlpatterns = [
    path('admin/transactions/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path(
        'admin/transactions/<int:transaction_id>/',
        AdminTransactionDetailView.as_view(),
        name='admin-transaction-detail',
    ),
]
