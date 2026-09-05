from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('INVESTOR', 'Investisseur'),
        ('PROJECT_OWNER', 'Porteur de projet'),
        ('INSURER', 'Assureur'),
        ('ADMIN', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='INVESTOR')

    phone = models.CharField(max_length=20, blank=True, null=True)

    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.username} - {self.role}'

    @property
    def kyc_status(self):
        if hasattr(self, 'kyc'):
            return self.kyc.status
        return 'NOT_SUBMITTED'


class KYCVerification(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('UNDER_REVIEW', 'En cours de vérification'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kyc'
    )

    id_document = models.FileField(upload_to='kyc/documents/')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    rejection_reason = models.TextField(blank=True, null=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    reviewed_at = models.DateTimeField(blank=True, null=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kyc_reviews',
    )

    def __str__(self):
        return f'KYC de {self.user.username} - {self.status}'
