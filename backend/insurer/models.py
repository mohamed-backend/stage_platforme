from django.conf import settings
from django.db import models


class CoverageRule(models.Model):
    RISK_LEVEL_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyen'),
        ('HIGH', 'Élevé'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    max_coverage = models.DecimalField(max_digits=15, decimal_places=2)
    premium_rate = models.DecimalField(
        max_digits=5, decimal_places=2, help_text='Taux de prime en pourcentage'
    )
    risk_levels = models.JSONField(
        default=list, help_text="Liste des niveaux de risque couverts: ['LOW', 'MEDIUM', 'HIGH']"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class InsurerReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('KYC_SUMMARY', 'Résumé KYC'),
        ('RISK_ANALYSIS', 'Analyse des risques'),
        ('COVERAGE_REPORT', 'Rapport de couverture'),
        ('PORTFOLIO_SUMMARY', 'Résumé du portefeuille'),
    ]

    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    data = models.JSONField(default=dict)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.report_type})'
