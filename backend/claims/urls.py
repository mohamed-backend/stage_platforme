from .views import (
    ClaimDetailView,
    ClaimListCreateView,
    ClaimNoteCreateView,
    ClaimReviewView,
)
from django.urls import include, path

urlpatterns = [
    path('', ClaimListCreateView.as_view(), name='claim-list-create'),
    path('<int:pk>/', ClaimDetailView.as_view(), name='claim-detail'),
    path('<int:pk>/review/', ClaimReviewView.as_view(), name='claim-review'),
    path('<int:pk>/notes/', ClaimNoteCreateView.as_view(), name='claim-note-create'),
    path('', include('claims.admin_urls')),
]
