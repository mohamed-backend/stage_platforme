# payments/services.py

"""Payment-related business logic services."""

import uuid
from .models import Payment
from django.utils import timezone
from investments.models import Investment
from notifications.models import Notification
from transactions.models import Transaction


class PaymentService:
    """Service for payment-related operations."""

    @staticmethod
    def create_payment(user, investment_id, method):
        """Create a payment for a pending investment."""
        try:
            investment = Investment.objects.get(id=investment_id, investor=user)
        except Investment.DoesNotExist:
            return None, 'Investment not found.'

        if investment.status != 'PENDING':
            return None, 'This investment cannot be paid.'

        if Payment.objects.filter(investment=investment).exists():
            return None, 'Payment already exists.'

        payment = Payment.objects.create(
            investment=investment,
            user=user,
            amount=investment.amount,
            method=method,
            status='PENDING',
            reference=f'PAY-{uuid.uuid4().hex[:12].upper()}',
        )

        return payment, None

    @staticmethod
    def get_user_payments(user):
        """Get payments for a user."""
        return (
            Payment.objects.filter(user=user)
            .select_related('investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )

    @staticmethod
    def get_payment_detail(payment_id, user):
        """Get payment detail for user."""
        try:
            return Payment.objects.select_related(
                'investment', 'investment__pool', 'investment__pool__project'
            ).get(id=payment_id, user=user)
        except Payment.DoesNotExist:
            return None

    @staticmethod
    def confirm_payment(payment_id, user):
        """Confirm a payment."""
        try:
            payment = Payment.objects.get(id=payment_id, user=user)
        except Payment.DoesNotExist:
            return None, 'Payment not found.'

        if payment.status != 'PENDING':
            return None, 'Payment cannot be confirmed.'

        payment.status = 'SUCCESS'
        payment.save(update_fields=['status', 'updated_at'])

        investment = payment.investment
        investment.status = 'CONFIRMED'
        investment.confirmed_at = timezone.now()
        investment.save(update_fields=['status', 'confirmed_at'])

        Transaction.objects.create(
            user=user,
            investment=investment,
            transaction_type='INVESTMENT',
            amount=payment.amount,
            status='COMPLETED',
            reference=f'TXN-{uuid.uuid4().hex[:12].upper()}',
            description=f'Investment in {investment.pool.project.title}',
        )

        Notification.objects.create(
            user=user,
            notification_type='PAYMENT',
            title='Paiement confirmé',
            message=(
                f'Votre paiement de {payment.amount} pour le projet '
                f'{investment.pool.project.title} a été confirmé.'
            ),
        )

        return payment, None
