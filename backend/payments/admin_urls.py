from .admin_views import AdminPaymentDetailView, AdminPaymentListView
from django.urls import path

urlpatterns = [
    path('admin/payments/', AdminPaymentListView.as_view(), name='admin-payment-list'),
    path(
        'admin/payments/<int:payment_id>/',
        AdminPaymentDetailView.as_view(),
        name='admin-payment-detail',
    ),
]
