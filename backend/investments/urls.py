from .views import (
    InvestmentCreateView,
    InvestmentDetailView,
    InvestmentListView,
    ProjectOwnerInvestmentListView,
)
from django.urls import include, path

urlpatterns = [
    path('', InvestmentCreateView.as_view(), name='investment-create'),
    path('mine/', InvestmentListView.as_view(), name='investment-list'),
    path('owner/', ProjectOwnerInvestmentListView.as_view(), name='owner-investments'),
    path('<int:investment_id>/', InvestmentDetailView.as_view(), name='investment-detail'),
    path('', include('investments.admin_urls')),
]
