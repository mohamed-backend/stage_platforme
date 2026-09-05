from .models import KYCVerification
from .serializers import KYCSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema
from insurer.models import CoverageRule
from projects.models import Project
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from risk_management.models import RiskAssessment


def require_insurer(user):
    return user.is_authenticated and user.role in ['INSURER', 'ADMIN']


@extend_schema(
    tags=['Insurer'],
    summary='Get insurer dashboard statistics',
    responses={
        200: OpenApiResponse(description='Stats object'),
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
    },
)
class InsurerStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        kyc_pending = KYCVerification.objects.filter(status='PENDING').count()
        kyc_reviewed = KYCVerification.objects.exclude(status='PENDING').count()
        projects_pending = Project.objects.filter(status='PENDING').count()
        projects_reviewed = Project.objects.exclude(status='PENDING').count()
        assessments = RiskAssessment.objects.count()

        return Response(
            {
                'total_kyc_pending': kyc_pending,
                'total_kyc_reviewed': kyc_reviewed,
                'total_projects_pending': projects_pending,
                'total_projects_reviewed': projects_reviewed,
                'total_assessments': assessments,
                'coverage_count': CoverageRule.objects.filter(is_active=True).count(),
            }
        )


@extend_schema(
    tags=['Insurer'],
    summary='List pending KYC for insurer review',
    responses={
        200: KYCSerializer(many=True),
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
    },
)
class InsurerPendingKYCView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        kyc_list = (
            KYCVerification.objects.filter(status='PENDING')
            .select_related('user')
            .order_by('-submitted_at')
        )

        data = []
        for kyc in kyc_list:
            data.append(
                {
                    'id': kyc.id,
                    'user': kyc.user_id,
                    'username': kyc.user.username,
                    'email': kyc.user.email,
                    'status': kyc.status,
                    'id_document': kyc.id_document.url if kyc.id_document else '',
                    'submitted_at': kyc.submitted_at.isoformat() if kyc.submitted_at else None,
                    'reviewed_at': kyc.reviewed_at.isoformat() if kyc.reviewed_at else None,
                    'rejection_reason': kyc.rejection_reason,
                }
            )

        return Response(data)
