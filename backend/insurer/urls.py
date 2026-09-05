from .views import (
    CoverageRuleDetailView,
    CoverageRuleListView,
    InsurerReportGenerateView,
    InsurerReportListView,
)
from django.urls import path

urlpatterns = [
    path('coverage/', CoverageRuleListView.as_view(), name='coverage-list'),
    path('coverage/<int:pk>/', CoverageRuleDetailView.as_view(), name='coverage-detail'),
    path('reports/', InsurerReportListView.as_view(), name='report-list'),
    path('reports/generate/', InsurerReportGenerateView.as_view(), name='report-generate'),
]
