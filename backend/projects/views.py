from .models import Project
from .serializers import ProjectSerializer
from .services import ProjectService
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


@extend_schema(
    tags=['Projects'],
    summary='List published projects',
    responses={200: ProjectSerializer(many=True)},
)
class ProjectListCreateView(APIView):
    pagination_class = PageNumberPagination

    def get_permissions(self):

        if self.request.method == 'POST':
            return [IsAuthenticated()]

        return [AllowAny()]

    @extend_schema(summary='List published projects', responses={200: ProjectSerializer(many=True)})
    def get(self, request):
        projects = ProjectService.get_published_projects()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(projects, request, view=self)
        if page is not None:
            serializer = ProjectSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='Create a new project (Project Owner only)',
        request=ProjectSerializer,
        responses={
            201: ProjectSerializer,
            403: OpenApiResponse(description='Only project owners can create projects'),
            400: OpenApiResponse(description='Validation error'),
        },
    )
    def post(self, request):

        if request.user.role != 'PROJECT_OWNER':
            return Response(
                {'detail': 'Project Owner role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            project = serializer.save(owner=request.user)

            return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Projects'],
    summary='List authenticated user projects (Project Owner only)',
    responses={
        200: ProjectSerializer(many=True),
        403: OpenApiResponse(description='Only project owners can access'),
    },
)
class MyProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'PROJECT_OWNER':
            return Response(
                {'detail': 'Access reserved for project owners.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        projects = ProjectService.get_user_projects(request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Projects'],
    summary='Get project detail',
    responses={
        200: ProjectSerializer,
        403: OpenApiResponse(description='Forbidden'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class ProjectDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self, project_id):

        try:
            return Project.objects.select_related('pool').get(id=project_id)
        except Project.DoesNotExist:
            return None

    def get(self, request, project_id):

        project = self.get_object(project_id)

        if not project:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        if project.status == 'PUBLISHED':
            return Response(ProjectSerializer(project).data)

        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        if project.owner == request.user:
            return Response(ProjectSerializer(project).data)

        if request.user.role == 'ADMIN':
            return Response(ProjectSerializer(project).data)

        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    @extend_schema(
        summary='Update project (Owner only, DRAFT/REJECTED only)',
        request=ProjectSerializer,
        responses={
            200: ProjectSerializer,
            403: OpenApiResponse(description='Not owner or forbidden'),
            400: OpenApiResponse(description='Cannot modify published project'),
            404: OpenApiResponse(description='Project not found'),
        },
    )
    def patch(self, request, project_id):

        project = self.get_object(project_id)

        if not project:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        if project.owner != request.user:
            return Response(
                {'detail': "Vous n'êtes pas le propriétaire."}, status=status.HTTP_403_FORBIDDEN
            )

        if project.status not in ['DRAFT', 'REJECTED']:
            return Response(
                {'detail': 'Ce projet ne peut plus être modifié.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProjectSerializer(project, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Projects'],
    summary='Submit project for review (Owner only)',
    responses={
        200: ProjectSerializer,
        403: OpenApiResponse(description='Not owner'),
        400: OpenApiResponse(description='Cannot submit project in current status'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class SubmitProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        project, error = ProjectService.submit_project(project, request.user)

        if error:
            return Response(
                {'detail': error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ProjectSerializer(project).data)


@extend_schema(
    tags=['Projects'],
    summary='List pending projects (Admin only)',
    responses={200: ProjectSerializer(many=True), 403: OpenApiResponse(description='Admin only')},
)
class AdminPendingProjectListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        projects = ProjectService.get_pending_projects()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Projects'],
    summary='Approve project (Admin only)',
    responses={
        200: ProjectSerializer,
        403: OpenApiResponse(description='Admin only'),
        400: OpenApiResponse(description='Project not in PENDING status'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class ApproveProjectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, project_id):

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        project, error = ProjectService.approve_project(project, request.user)

        if error:
            return Response(
                {'detail': error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'message': 'Project published successfully.',
                'project': ProjectSerializer(project).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=['Projects'],
    summary='Reject project (Admin only)',
    responses={
        200: ProjectSerializer,
        403: OpenApiResponse(description='Admin only'),
        400: OpenApiResponse(description='Project not in PENDING status'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class RejectProjectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, project_id):

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        project, error = ProjectService.reject_project(project, request.user)

        if error:
            return Response(
                {'detail': error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'message': 'Projet rejeté.', 'project': ProjectSerializer(project).data},
            status=status.HTTP_200_OK,
        )
