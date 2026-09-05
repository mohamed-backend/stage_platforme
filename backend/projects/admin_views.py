from .models import Project
from .serializers import ProjectSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


@extend_schema(
    tags=['Projects - Admin'],
    summary='List all projects (Admin only)',
    responses={200: ProjectSerializer(many=True), 403: OpenApiResponse(description='Admin only')},
)
class AdminProjectListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        projects = Project.objects.all().select_related('owner', 'pool').order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Projects - Admin'],
    summary='Get project detail (Admin only)',
    responses={
        200: ProjectSerializer,
        403: OpenApiResponse(description='Admin only'),
        404: OpenApiResponse(description='Project not found'),
    },
)
class AdminProjectDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, project_id):
        try:
            project = Project.objects.select_related('owner', 'pool').get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    @extend_schema(
        summary='Update project (Admin only)',
        request=ProjectSerializer,
        responses={
            200: ProjectSerializer,
            403: OpenApiResponse(description='Admin only'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Project not found'),
        },
    )
    def patch(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary='Delete project (Admin only)',
        responses={
            204: OpenApiResponse(description='Project deleted'),
            403: OpenApiResponse(description='Admin only'),
            404: OpenApiResponse(description='Project not found'),
        },
    )
    def delete(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
