from .insurer_views import InsurerPendingKYCView, InsurerStatsView
from .views import (
    KYCReviewView,
    KYCSubmitView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PublicStatsView,
    RegisterView,
)
from django.urls import include, path

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('kyc/', KYCSubmitView.as_view(), name='kyc'),
    path('kyc/<int:pk>/review/', KYCReviewView.as_view(), name='kyc-review'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path(
        'password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'
    ),
    path('insurer/stats/', InsurerStatsView.as_view(), name='insurer-stats'),
    path('insurer/kyc/pending/', InsurerPendingKYCView.as_view(), name='insurer-kyc-pending'),
    path('stats/public/', PublicStatsView.as_view(), name='public-stats'),
    path('', include('users.admin_urls')),
]
