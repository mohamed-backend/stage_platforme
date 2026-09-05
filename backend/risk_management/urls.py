from .views import (
    RiskAssessmentCalculateAllView,
    RiskAssessmentCalculatePendingView,
    RiskAssessmentCalculateView,
    RiskAssessmentDetailView,
    RiskAssessmentListView,
)
from django.urls import path

urlpatterns = [
    path('', RiskAssessmentListView.as_view(), name='risk-assessment-list'),
    path(
        'project/<int:project_id>/',
        RiskAssessmentDetailView.as_view(),
        name='risk-assessment-detail',
    ),
    path(
        'calculate/<int:project_id>/',
        RiskAssessmentCalculateView.as_view(),
        name='risk-assessment-calculate',
    ),
    path(
        'calculate/all/',
        RiskAssessmentCalculateAllView.as_view(),
        name='risk-assessment-calculate-all',
    ),
    path(
        'calculate/pending/',
        RiskAssessmentCalculatePendingView.as_view(),
        name='risk-assessment-calculate-pending',
    ),
]
