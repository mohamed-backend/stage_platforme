from .models import RiskAssessment
from .serializers import RiskAssessmentSerializer
from .services import (
    calculate_risk_for_all_published,
    calculate_risk_for_pending,
    calculate_risk_for_project,
)
from drf_spectacular.utils import OpenApiResponse, extend_schema
from projects.models import Project
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


class RiskAssessmentListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='List all risk assessments for published projects',
        responses={200: RiskAssessmentSerializer(many=True)},
    )
    def get(self, request):
        assessments = (
            RiskAssessment.objects.select_related('project')
            .filter(project__status='PUBLISHED')
            .order_by('-assessed_at')
        )
        serializer = RiskAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)


class RiskAssessmentDetailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Get risk assessment for a specific project',
        responses={
            200: RiskAssessmentSerializer,
            404: OpenApiResponse(description='Project or assessment not found'),
        },
    )
    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, status='PUBLISHED')
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            assessment = RiskAssessment.objects.get(project=project)
        except RiskAssessment.DoesNotExist:
            assessment = calculate_risk_for_project(project)

        serializer = RiskAssessmentSerializer(assessment)
        return Response(serializer.data)


class RiskAssessmentCalculateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Risk Management'],
        summary='Calculate risk assessment for a specific project (Admin/Insurer only)',
        responses={
            200: RiskAssessmentSerializer,
            403: OpenApiResponse(description='Forbidden - Admin/Insurer only'),
            404: OpenApiResponse(description='Project not found'),
        },
    )
    def post(self, request, project_id):
        if request.user.role not in ['ADMIN', 'INSURER']:
            return Response(
                {'detail': 'Access reserved for administrators and insurers.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        assessment = calculate_risk_for_project(project)
        serializer = RiskAssessmentSerializer(assessment)
        return Response(serializer.data)


class RiskAssessmentCalculateAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        tags=['Risk Management'],
        summary='Calculate risk assessments for all published projects (Admin only)',
        responses={
            200: OpenApiResponse(description='List of calculated assessments'),
            403: OpenApiResponse(description='Forbidden - Admin only'),
        },
    )
    def post(self, request):
        results = calculate_risk_for_all_published()
        return Response(
            {'message': f'{len(results)} évaluations de risque calculées.', 'assessments': results}
        )


class RiskAssessmentCalculatePendingView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Risk Management'],
        summary='Calculate risk assessments for pending projects (Admin/Insurer only)',
        responses={
            200: OpenApiResponse(description='List of calculated assessments'),
            403: OpenApiResponse(description='Forbidden - Admin/Insurer only'),
        },
    )
    def post(self, request):
        if request.user.role not in ['ADMIN', 'INSURER']:
            return Response(
                {'detail': 'Access reserved for administrators and insurers.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        results = calculate_risk_for_pending()
        return Response(
            {
                'message': f'{len(results)} évaluations de risque calculées pour les projets en attente.',
                'assessments': results,
            }
        )
