# secondary_market/services.py

"""Secondary market-related business logic services."""

import uuid
from .models import Listing
from django.db import transaction
from django.utils import timezone
from investments.models import Investment
from notifications.models import Notification
from transactions.models import Transaction


class ListingService:
    """Service for listing-related operations."""

    @staticmethod
    def create_listing(user, investment_id, price):
        """Create a listing for a confirmed investment."""
        try:
            investment = Investment.objects.get(id=investment_id, investor=user)
        except Investment.DoesNotExist:
            return None, 'Investment not found.'

        if investment.status != 'CONFIRMED':
            return None, 'Only confirmed investments can be sold.'

        if Listing.objects.filter(investment=investment, status='ACTIVE').exists():
            return None, 'Investment is already listed.'

        listing = Listing.objects.create(seller=user, investment=investment, price=price)

        Notification.objects.create(
            user=user,
            notification_type='MARKET',
            title='Investissement mis en vente',
            message=(
                f'Votre investissement dans {investment.pool.project.title} '
                f'a été mis en vente au prix de {price}.'
            ),
        )

        return listing, None

    @staticmethod
    def get_market_listings(user):
        """Get active listings excluding user's own."""
        return (
            Listing.objects.filter(status='ACTIVE')
            .exclude(seller=user)
            .select_related('seller', 'investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )

    @staticmethod
    def get_user_listings(user):
        """Get user's listings."""
        return (
            Listing.objects.filter(seller=user)
            .select_related('investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )

    @staticmethod
    def cancel_listing(listing_id, user):
        """Cancel user's listing."""
        try:
            listing = Listing.objects.get(id=listing_id, seller=user)
        except Listing.DoesNotExist:
            return None, 'Listing not found.'

        if listing.status != 'ACTIVE':
            return None, 'Listing is not active.'

        listing.status = 'CANCELLED'
        listing.save(update_fields=['status', 'updated_at'])

        Notification.objects.create(
            user=user,
            notification_type='MARKET',
            title='Annonce annulée',
            message=(
                f"Votre annonce pour l'investissement dans "
                f'{listing.investment.pool.project.title} a été annulée.'
            ),
        )

        return listing, None

    @staticmethod
    def buy_listing(listing_id, user):
        """Buy a listing."""
        if user.role != 'INVESTOR':
            return None, 'Only investors can buy listings.'

        if user.kyc_status != 'APPROVED':
            return None, 'Your KYC must be approved before buying.'

        try:
            listing = Listing.objects.select_related(
                'investment', 'investment__pool', 'investment__pool__project', 'seller'
            ).get(id=listing_id)
        except Listing.DoesNotExist:
            return None, 'Listing not found.'

        if listing.status != 'ACTIVE':
            return None, 'Listing is not available for purchase.'

        if listing.seller_id == user.id:
            return None, 'You cannot buy your own listing.'

        with transaction.atomic():
            locked_listing = Listing.objects.select_for_update().get(id=listing.id)

            if locked_listing.status != 'ACTIVE':
                return None, 'Listing is no longer available.'

            investment = locked_listing.investment

            investment.investor = user
            investment.confirmed_at = timezone.now()
            investment.save(update_fields=['investor', 'confirmed_at', 'updated_at'])

            locked_listing.status = 'SOLD'
            locked_listing.save(update_fields=['status', 'updated_at'])

            project_title = (
                investment.pool.project.title
                if investment.pool and investment.pool.project
                else 'un projet'
            )

            Transaction.objects.create(
                user=user,
                investment=investment,
                transaction_type='INVESTMENT',
                amount=locked_listing.price,
                status='COMPLETED',
                reference=f'TXN-{uuid.uuid4().hex[:12].upper()}',
                description=f"Achat d'investissement sur le marché secondaire ({project_title})",
            )

            Notification.objects.create(
                user=user,
                notification_type='MARKET',
                title='Achat effectué',
                message=f'Vous avez acheté un investissement dans {project_title} pour {locked_listing.price}.',
            )

            Notification.objects.create(
                user=locked_listing.seller,
                notification_type='MARKET',
                title='Vente conclue',
                message=f'Votre annonce pour {project_title} a été vendue au prix de {locked_listing.price}.',
            )

        return locked_listing, None
