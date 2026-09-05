from django.conf import settings
from django.db import models


class Claim(models.Model):
    STATUS_CHOICES = [
        ('SUBMITTED', 'Soumise'),
        ('UNDER_REVIEW', 'En cours de revue'),
        ('APPROVED', 'Approuvée'),
        ('REJECTED', 'Rejetée'),
        ('PAID', 'Indemnisée'),
        ('CLOSED', 'Clôturée'),
    ]

    TYPE_CHOICES = [
        ('PROJECT_FAILURE', 'Défaillance projet'),
        ('PAYMENT_ISSUE', 'Problème de paiement'),
        ('PLATFORM_ISSUE', 'Problème plateforme'),
        ('OTHER', 'Autre'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyenne'),
        ('HIGH', 'Élevée'),
    ]

    claimant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='claims_filed'
    )

    investment = models.ForeignKey(
        'investments.Investment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claims',
    )

    claim_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='OTHER')

    title = models.CharField(max_length=200)
    description = models.TextField()

    amount_claimed = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Montant réclamé (si applicable)',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claims_assigned',
    )

    resolution_note = models.TextField(
        blank=True, default='', help_text="Note de résolution fournie par l'assureur/admin"
    )

    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Claim'
        verbose_name_plural = 'Claims'
        constraints = [
            models.UniqueConstraint(
                fields=['claimant', 'investment'],
                name='unique_claim_per_investment',
                condition=models.Q(investment__isnull=False),
            )
        ]

    def __str__(self):
        return f'Claim #{self.id} - {self.title} ({self.status})'


class ClaimNote(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='notes')

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='claim_notes'
    )

    is_internal = models.BooleanField(
        default=False, help_text='Note interne (assureur/admin uniquement)'
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Note sur Claim #{self.claim_id} par {self.author_id}'
