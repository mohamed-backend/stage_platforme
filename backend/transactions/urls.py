# transactions/urls.py

from .views import (
    TransactionDetailView,
    TransactionListView,
)
from django.urls import include, path

urlpatterns = [
    path('mine/', TransactionListView.as_view(), name='transaction-list'),
    path('<int:transaction_id>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('', include('transactions.admin_urls')),
]
