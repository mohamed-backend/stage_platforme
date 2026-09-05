from .serializers import PoolSerializer
from .services import PoolService
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=['Pools'],
    summary='List open pools',
    responses={200: PoolSerializer(many=True)},
)
class PoolListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        pools = PoolService.get_open_pools()
        serializer = PoolSerializer(pools, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Pools'],
    summary='Get pool detail',
    responses={
        200: PoolSerializer,
        404: OpenApiResponse(description='Pool not found'),
    },
)
class PoolDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pool_id):
        pool = PoolService.get_pool_detail(pool_id)

        if not pool:
            return Response({'detail': 'Pool not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PoolSerializer(pool)
        return Response(serializer.data)


@extend_schema(
    tags=['Pools'],
    summary='List user pools',
    responses={200: PoolSerializer(many=True), 403: OpenApiResponse(description='Forbidden')},
)
class MyPoolsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pools, error = PoolService.get_user_pools(request.user)

        if error:
            return Response(
                {'detail': error},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PoolSerializer(pools, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Pools'],
    summary='Create a pool (Project Owner only)',
    request=PoolSerializer,
    responses={
        201: PoolSerializer,
        400: OpenApiResponse(description='Validation error'),
        403: OpenApiResponse(description='Forbidden'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class CreatePoolView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'PROJECT_OWNER':
            return Response(
                {'detail': 'Project Owner role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        pool, error = PoolService.create_pool(
            request.user, request.data.get('project'), request.data
        )

        if error:
            if 'owner' in error.lower() or 'project owner' in error.lower():
                status_code = status.HTTP_403_FORBIDDEN
            elif 'not found' in error.lower():
                status_code = status.HTTP_404_NOT_FOUND
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(PoolSerializer(pool).data, status=status.HTTP_201_CREATED)
