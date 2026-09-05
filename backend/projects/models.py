from django.conf import settings
from django.db import models


class Project(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('PENDING', 'En attente de validation'),
        ('PUBLISHED', 'Publié'),
        ('REJECTED', 'Rejeté'),
        ('CLOSED', 'Clôturé'),
    ]

    RISK_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyen'),
        ('HIGH', 'Élevé'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects'
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    risk_type = models.CharField(max_length=100)

    category = models.CharField(max_length=100, blank=True, default='')

    image = models.URLField(max_length=500, blank=True, default='')

    target_amount = models.DecimalField(max_digits=12, decimal_places=2)

    duration_months = models.PositiveIntegerField()

    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default='MEDIUM')

    expected_return = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text='Expected annual return percentage (e.g. 8.50 for 8.5%)',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
