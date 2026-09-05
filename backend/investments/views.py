from .serializers import InvestmentSerializer
from .services import InvestmentService
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=['Investments'],
    summary='Create an investment',
    request=InvestmentSerializer,
    responses={
        201: InvestmentSerializer,
        400: OpenApiResponse(description='Validation error'),
        403: OpenApiResponse(description='Forbidden'),
        404: OpenApiResponse(description='Pool not found'),
    },
)
class InvestmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InvestmentSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        pool_id = serializer.validated_data['pool'].id
        amount = serializer.validated_data['amount']

        investment, error = InvestmentService.create_investment(request.user, pool_id, amount)

        if error:
            if (
                'kyc' in error.lower()
                or 'investor' in error.lower()
                or 'unauthorized' in error.lower()
            ):
                status_code = status.HTTP_403_FORBIDDEN
            elif 'not found' in error.lower():
                status_code = status.HTTP_404_NOT_FOUND
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(InvestmentSerializer(investment).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Investments'],
    summary='List own investments',
    responses={200: InvestmentSerializer(many=True)},
)
class InvestmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        investments = InvestmentService.get_user_investments(request.user)
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Investments'],
    summary='Get investment detail',
    responses={
        200: InvestmentSerializer,
        404: OpenApiResponse(description='Investment not found'),
    },
)
class InvestmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, investment_id):
        investment = InvestmentService.get_investment_detail(investment_id, request.user)

        if not investment:
            return Response({'detail': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)


@extend_schema(
    tags=['Investments'],
    summary='List investments for project owner',
    responses={200: InvestmentSerializer(many=True), 403: OpenApiResponse(description='Forbidden')},
)
class ProjectOwnerInvestmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PROJECT_OWNER':
            return Response(
                {'detail': 'Project Owner role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        project_id = request.query_params.get('project')

        if project_id:
            try:
                project_id = int(project_id)
            except (TypeError, ValueError):
                return Response(
                    {'detail': 'Invalid project ID.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        investments, error = InvestmentService.get_owner_investments(
            request.user, project_id=project_id
        )

        if error:
            return Response(
                {'detail': error},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)
