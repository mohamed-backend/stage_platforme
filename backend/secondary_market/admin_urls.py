from .admin_views import AdminListingDetailView, AdminListingListView
from django.urls import path

urlpatterns = [
    path('admin/listings/', AdminListingListView.as_view(), name='admin-listing-list'),
    path(
        'admin/listings/<int:listing_id>/',
        AdminListingDetailView.as_view(),
        name='admin-listing-detail',
    ),
]
