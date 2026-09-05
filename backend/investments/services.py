# investments/services.py

"""Investment-related business logic services."""

from .models import Investment
from django.db import transaction
from django.utils import timezone
from notifications.models import Notification
from pools.models import Pool


class InvestmentService:
    """Service for investment-related operations."""

    @staticmethod
    def create_investment(investor, pool_id, amount):
        """Create a new investment."""
        if investor.role != 'INVESTOR':
            return None, 'Only investors can invest.'

        if investor.kyc_status != 'APPROVED':
            return None, 'Your KYC must be approved before investing.'

        with transaction.atomic():
            try:
                pool = Pool.objects.select_for_update().get(id=pool_id)
            except Pool.DoesNotExist:
                return None, 'Pool not found.'

            if pool.status != 'OPEN':
                return None, "Ce pool n'est pas ouvert."

            now = timezone.now()

            if now < pool.start_date:
                return None, "La période d'investissement n'a pas encore commencé."

            if now > pool.end_date:
                pool.update_status()
                return None, "La période d'investissement est terminée."

            if amount <= 0:
                return None, "Le montant de l'investissement doit être supérieur à 0."

            if amount < pool.minimum_investment:
                return None, f"Le montant minimum d'investissement est {pool.minimum_investment}."

            remaining_amount = pool.target_amount - pool.collected_amount
            if amount > remaining_amount:
                return None, f'Le montant dépasse le montant restant du pool ({remaining_amount}).'

            investment = Investment.objects.create(
                investor=investor,
                pool=pool,
                amount=amount,
                status='PENDING',
            )

            pool.collected_amount += amount

            if pool.collected_amount >= pool.target_amount:
                pool.status = 'FUNDED'

            pool.save(
                update_fields=[
                    'collected_amount',
                    'status',
                    'updated_at',
                ]
            )

        Notification.objects.create(
            user=investor,
            notification_type='INVESTMENT',
            title='Investissement créé',
            message=(
                f'Votre investissement de {amount} dans le projet '
                f'{pool.project.title} a été créé en attente de paiement.'
            ),
        )

        return investment, None

    @staticmethod
    def get_user_investments(user):
        """Get investments for a user."""
        return (
            Investment.objects.filter(investor=user)
            .select_related('pool', 'pool__project')
            .order_by('-created_at')
        )

    @staticmethod
    def get_investment_detail(investment_id, user):
        """Get investment detail for user."""
        try:
            return Investment.objects.select_related('pool', 'pool__project', 'investor').get(
                id=investment_id, investor=user
            )
        except Investment.DoesNotExist:
            return None

    @staticmethod
    def get_owner_investments(user, project_id=None):
        """Get investments for projects owned by user."""
        if user.role != 'PROJECT_OWNER':
            return None, 'Access reserved for project owners.'

        queryset = (
            Investment.objects.filter(pool__project__owner=user)
            .select_related('investor', 'pool', 'pool__project')
            .order_by('-created_at')
        )

        if project_id:
            queryset = queryset.filter(pool__project_id=project_id)

        return queryset, None
