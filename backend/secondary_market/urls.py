# secondary_market/urls.py

from .views import (
    ListingBuyView,
    ListingCancelView,
    ListingCreateView,
    ListingListView,
    MyListingListView,
)
from django.urls import include, path

urlpatterns = [
    path('', ListingCreateView.as_view(), name='listing-create'),
    path('market/', ListingListView.as_view(), name='listing-market'),
    path('mine/', MyListingListView.as_view(), name='listing-mine'),
    path('<int:listing_id>/cancel/', ListingCancelView.as_view(), name='listing-cancel'),
    path('<int:listing_id>/buy/', ListingBuyView.as_view(), name='listing-buy'),
    path('', include('secondary_market.admin_urls')),
]
