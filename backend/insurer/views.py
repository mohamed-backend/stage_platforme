from .models import CoverageRule, InsurerReport
from .serializers import CoverageRuleSerializer, InsurerReportSerializer
from django.db import models
from drf_spectacular.utils import OpenApiResponse, extend_schema
from investments.models import Investment
from payments.models import Payment
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from risk_management.models import RiskAssessment
from users.models import KYCVerification


def require_insurer(user):
    return user.is_authenticated and user.role in ['INSURER', 'ADMIN']


@extend_schema(
    tags=['Insurer'],
    summary='List coverage rules',
    responses={
        200: CoverageRuleSerializer(many=True),
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
    },
)
class CoverageRuleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rules = CoverageRule.objects.all()
        serializer = CoverageRuleSerializer(rules, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='Create coverage rule',
        request=CoverageRuleSerializer,
        responses={
            201: CoverageRuleSerializer,
            400: OpenApiResponse(description='Validation error'),
            403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
        },
    )
    def post(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CoverageRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Insurer'],
    summary='Get coverage rule detail',
    responses={
        200: CoverageRuleSerializer,
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
        404: OpenApiResponse(description='Not found'),
    },
)
class CoverageRuleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return CoverageRule.objects.get(pk=pk)
        except CoverageRule.DoesNotExist:
            return None

    def get(self, request, pk):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rule = self.get_object(pk)
        if not rule:
            return Response(
                {'detail': 'Coverage rule not found.'}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CoverageRuleSerializer(rule)
        return Response(serializer.data)

    @extend_schema(
        summary='Update coverage rule',
        request=CoverageRuleSerializer,
        responses={
            200: CoverageRuleSerializer,
            400: OpenApiResponse(description='Validation error'),
            403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
            404: OpenApiResponse(description='Not found'),
        },
    )
    def patch(self, request, pk):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rule = self.get_object(pk)
        if not rule:
            return Response(
                {'detail': 'Coverage rule not found.'}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CoverageRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary='Delete coverage rule',
        responses={
            204: OpenApiResponse(description='Deleted'),
            403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
            404: OpenApiResponse(description='Not found'),
        },
    )
    def delete(self, request, pk):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rule = self.get_object(pk)
        if not rule:
            return Response(
                {'detail': 'Coverage rule not found.'}, status=status.HTTP_404_NOT_FOUND
            )

        rule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=['Insurer'],
    summary='List insurer reports',
    responses={
        200: InsurerReportSerializer(many=True),
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
    },
)
class InsurerReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        reports = InsurerReport.objects.select_related('generated_by').all()
        serializer = InsurerReportSerializer(reports, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Insurer'],
    summary='Generate insurer report',
    request={
        'type': 'object',
        'properties': {
            'report_type': {
                'type': 'string',
                'enum': ['KYC_SUMMARY', 'RISK_ANALYSIS', 'COVERAGE_REPORT', 'PORTFOLIO_SUMMARY'],
            },
            'title': {'type': 'string'},
        },
        'required': ['report_type', 'title'],
    },
    responses={
        201: InsurerReportSerializer,
        400: OpenApiResponse(description='Validation error'),
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
    },
)
class InsurerReportGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not require_insurer(request.user):
            return Response(
                {'detail': 'Access reserved for insurers and administrators.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        report_type = request.data.get('report_type')
        title = request.data.get('title')

        if not report_type or not title:
            return Response(
                {'detail': 'Report type and title are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_types = ['KYC_SUMMARY', 'RISK_ANALYSIS', 'COVERAGE_REPORT', 'PORTFOLIO_SUMMARY']
        if report_type not in valid_types:
            return Response({'detail': 'Invalid report type.'}, status=status.HTTP_400_BAD_REQUEST)

        data = {}

        if report_type == 'KYC_SUMMARY':
            pending = KYCVerification.objects.filter(status='PENDING').count()
            approved = KYCVerification.objects.filter(status='APPROVED').count()
            rejected = KYCVerification.objects.filter(status='REJECTED').count()
            data = {
                'total_pending': pending,
                'total_approved': approved,
                'total_rejected': rejected,
                'total': pending + approved + rejected,
            }
        elif report_type == 'RISK_ANALYSIS':
            assessments = RiskAssessment.objects.all()
            data = {
                'total_assessments': assessments.count(),
                'by_level': {
                    'LOW': assessments.filter(level='LOW').count(),
                    'MEDIUM': assessments.filter(level='MEDIUM').count(),
                    'HIGH': assessments.filter(level='HIGH').count(),
                },
                'avg_score': float(assessments.aggregate(avg=models.Avg('score'))['avg'] or 0),
            }
        elif report_type == 'COVERAGE_REPORT':
            rules = CoverageRule.objects.filter(is_active=True)
            data = {
                'active_rules': rules.count(),
                'total_rules': CoverageRule.objects.count(),
                'coverage_by_level': {},
            }
            for rule in rules:
                for level in rule.risk_levels:
                    data['coverage_by_level'][level] = data['coverage_by_level'].get(level, 0) + 1
        elif report_type == 'PORTFOLIO_SUMMARY':
            investments = Investment.objects.filter(status='CONFIRMED')
            payments = Payment.objects.filter(status='SUCCESS')
            data = {
                'total_investments': investments.count(),
                'total_amount': float(
                    investments.aggregate(total=models.Sum('amount'))['total'] or 0
                ),
                'total_payments': payments.count(),
                'total_paid': float(payments.aggregate(total=models.Sum('amount'))['total'] or 0),
            }

        report = InsurerReport.objects.create(
            title=title, report_type=report_type, data=data, generated_by=request.user
        )

        serializer = InsurerReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
