# notifications/views.py

from .models import Notification
from .serializers import NotificationSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=['Notifications'],
    summary='List own notifications',
    responses={200: NotificationSerializer(many=True)},
)
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request):

        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(notifications, request, view=self)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = NotificationSerializer(notifications, many=True)

        return Response(serializer.data)


@extend_schema(
    tags=['Notifications'],
    summary='Mark notification as read',
    responses={
        200: NotificationSerializer,
        404: OpenApiResponse(description='Notification not found'),
    },
)
class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):

        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save(update_fields=['is_read'])

        return Response(NotificationSerializer(notification).data)


@extend_schema(
    tags=['Notifications'],
    summary='Mark all notifications as read',
    responses={200: OpenApiResponse(description='All notifications marked as read')},
)
class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)

        return Response({'detail': 'All notifications marked as read.'})
