# notifications/serializers.py

from .models import Notification
from rest_framework import serializers


class NotificationSerializer(serializers.ModelSerializer):
    notification_type = serializers.CharField(read_only=True)
    user = serializers.IntegerField(source='user_id', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'notification_type',
            'title',
            'message',
            'is_read',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'notification_type',
            'title',
            'message',
            'created_at',
        ]
