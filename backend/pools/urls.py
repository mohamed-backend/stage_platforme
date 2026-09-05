from .views import (
    CreatePoolView,
    MyPoolsView,
    PoolDetailView,
    PoolListView,
)
from django.urls import path

urlpatterns = [
    path('', PoolListView.as_view(), name='pool-list'),
    path('mine/', MyPoolsView.as_view(), name='pool-mine'),
    path('create/', CreatePoolView.as_view(), name='pool-create'),
    path('<int:pool_id>/', PoolDetailView.as_view(), name='pool-detail'),
]
