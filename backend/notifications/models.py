# notifications/models.py

from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('INVESTMENT', 'Investment'),
        ('PAYMENT', 'Payment'),
        ('TRANSACTION', 'Transaction'),
        ('MARKET', 'Secondary Market'),
        ('PROJECT', 'Project'),
        ('SYSTEM', 'System'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )

    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    title = models.CharField(max_length=255)

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} - {self.title}'
