# payments/models.py

from django.conf import settings
from django.db import models


class Payment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    METHOD_CHOICES = [
        ('CARD', 'Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('WALLET', 'Wallet'),
    ]

    investment = models.OneToOneField(
        'investments.Investment', on_delete=models.CASCADE, related_name='payment'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments'
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    method = models.CharField(max_length=30, choices=METHOD_CHOICES)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    reference = models.CharField(max_length=100, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Payment {self.reference} - {self.amount}'
