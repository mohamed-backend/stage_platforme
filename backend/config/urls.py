from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/projects/', include('projects.urls')),
    path('api/pools/', include('pools.urls')),
    path('api/investments/', include('investments.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/secondary-market/', include('secondary_market.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/risk/', include('risk_management.urls')),
    path('api/insurer/', include('insurer.urls')),
    path('api/claims/', include('claims.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
