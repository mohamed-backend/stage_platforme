# secondary_market/models.py

from django.conf import settings
from django.db import models


class Listing(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('SOLD', 'Sold'),
        ('CANCELLED', 'Cancelled'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings'
    )

    investment = models.OneToOneField(
        'investments.Investment', on_delete=models.CASCADE, related_name='listing'
    )

    price = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Listing #{self.id} - {self.price}'
