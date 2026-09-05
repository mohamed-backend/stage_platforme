# payments/urls.py

from .views import (
    PaymentConfirmView,
    PaymentCreateView,
    PaymentDetailView,
    PaymentListView,
)
from django.urls import include, path

urlpatterns = [
    path('', PaymentCreateView.as_view(), name='payment-create'),
    path('mine/', PaymentListView.as_view(), name='payment-list'),
    path('<int:payment_id>/', PaymentDetailView.as_view(), name='payment-detail'),
    path('<int:payment_id>/confirm/', PaymentConfirmView.as_view(), name='payment-confirm'),
    path('', include('payments.admin_urls')),
]
