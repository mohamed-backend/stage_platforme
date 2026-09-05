from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Pool(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Ouvert'),
        ('FUNDED', 'Financé'),
        ('CLOSED', 'Clôturé'),
        ('CANCELLED', 'Annulé'),
    ]

    project = models.OneToOneField(
        'projects.Project', on_delete=models.CASCADE, related_name='pool'
    )

    target_amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )

    collected_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )

    minimum_investment = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    @property
    def remaining_amount(self):
        return max(self.target_amount - self.collected_amount, 0)

    @property
    def funding_percentage(self):

        if self.target_amount == 0:
            return 0

        return round((self.collected_amount / self.target_amount) * 100, 2)

    def update_status(self):

        now = timezone.now()

        if self.status == 'CANCELLED':
            return

        if self.collected_amount >= self.target_amount:
            self.status = 'FUNDED'

        elif now > self.end_date:
            self.status = 'CLOSED'

        else:
            self.status = 'OPEN'

        self.save(update_fields=['status', 'updated_at'])

    def __str__(self):
        return f'Pool - {self.project.title}'
