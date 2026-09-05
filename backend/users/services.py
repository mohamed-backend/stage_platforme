# users/services.py

"""User-related business logic services."""

from .models import KYCVerification, User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from notifications.models import Notification


class UserService:
    """Service for user-related operations."""

    @staticmethod
    def create_user(validated_data, password):
        """Create a new user with password."""
        user = User.objects.create_user(password=password, **validated_data)
        return user

    @staticmethod
    def update_profile(user, data):
        """Update user profile."""
        for key, value in data.items():
            setattr(user, key, value)
        user.save()
        return user

    @staticmethod
    def request_password_reset(email, frontend_url):
        """Send password reset email to user."""
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return True

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f'{frontend_url}/reset-password/{uid}/{token}/'

        send_mail(
            subject='Password Reset - Fundsy',
            message=(
                f'Hello {user.username},\n\n'
                f'You requested a password reset.\n'
                f'Click the link below to set a new password:\n\n'
                f'{reset_link}\n\n'
                f'This link expires in 24 hours.\n\n'
                f'If you did not request this, ignore this email.\n\n'
                f'The Fundsy Team'
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True

    @staticmethod
    def confirm_password_reset(uid, token, new_password):
        """Confirm password reset with token."""
        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return False, 'Invalid reset link.'

        if not default_token_generator.check_token(user, token):
            return False, 'Invalid or expired reset link.'

        user.set_password(new_password)
        user.save()
        return True, 'Password reset successful.'


class KYCService:
    """Service for KYC verification operations."""

    @staticmethod
    def submit_kyc(user, id_document):
        """Submit KYC document for user."""
        if hasattr(user, 'kyc'):
            return None, 'A KYC document already exists for this user.'

        kyc = KYCVerification.objects.create(user=user, id_document=id_document)
        return kyc, None

    @staticmethod
    def review_kyc(kyc, reviewer, status, rejection_reason=None):
        """Review KYC document."""
        kyc.status = status
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = reviewer
        kyc.rejection_reason = rejection_reason if status == 'REJECTED' else ''
        kyc.save()

        if status == 'APPROVED':
            Notification.objects.create(
                user=kyc.user,
                notification_type='SYSTEM',
                title='KYC approuvé',
                message="Votre vérification d'identité a été approuvée. Vous pouvez maintenant investir.",
            )
        elif status == 'REJECTED':
            reason = rejection_reason or ''
            Notification.objects.create(
                user=kyc.user,
                notification_type='SYSTEM',
                title='KYC rejeté',
                message=f"Votre vérification d'identité a été rejetée. {reason}".strip(),
            )

        return kyc
