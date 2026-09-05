# projects/services.py

"""Project-related business logic services."""

from .models import Project
from django.db import models
from django.db.models import F
from notifications.models import Notification


class ProjectService:
    """Service for project-related operations."""

    @staticmethod
    def submit_project(project, user):
        """Submit project for review."""
        if project.owner != user:
            return None, "Vous n'êtes pas le propriétaire de ce projet."

        if project.status not in ['DRAFT', 'REJECTED']:
            return None, 'Ce projet ne peut pas être soumis.'

        project.status = 'PENDING'
        project.save()

        Notification.objects.create(
            user=project.owner,
            notification_type='PROJECT',
            title='Projet soumis',
            message=(
                f'Votre projet "{project.title}" a été soumis pour vérification. '
                f"Vous serez notifié lorsqu'il sera examiné."
            ),
        )
        return project, None

    @staticmethod
    def approve_project(project, _user):
        """Approve project (admin only)."""
        if project.status != 'PENDING':
            return None, 'Seul un projet en attente peut être validé.'

        project.status = 'PUBLISHED'
        project.save()

        Notification.objects.create(
            user=project.owner,
            notification_type='PROJECT',
            title='Projet publié',
            message=(
                f'Votre projet "{project.title}" a été approuvé et est maintenant '
                f'visible aux investisseurs.'
            ),
        )
        return project, None

    @staticmethod
    def reject_project(project, _user):
        """Reject project (admin only)."""
        if project.status != 'PENDING':
            return None, 'Seul un projet en attente peut être rejeté.'

        project.status = 'REJECTED'
        project.save()

        Notification.objects.create(
            user=project.owner,
            notification_type='PROJECT',
            title='Projet rejeté',
            message=(
                f'Votre projet "{project.title}" a été rejeté. '
                f'Modifiez-le et soumettez-le à nouveau.'
            ),
        )
        return project, None

    @staticmethod
    def get_published_projects():
        """Get all published projects with pool info."""
        return (
            Project.objects.filter(status='PUBLISHED')
            .select_related('pool')
            .order_by('-created_at')
        )

    @staticmethod
    def get_user_projects(user):
        """Get projects owned by user."""
        return Project.objects.filter(owner=user).select_related('pool').order_by('-created_at')

    @staticmethod
    def get_pending_projects():
        """Get pending projects for admin/insurer review."""
        return (
            Project.objects.filter(status='PENDING').select_related('pool').order_by('created_at')
        )

    @staticmethod
    def get_public_stats():
        """Get public platform statistics."""
        published_projects = Project.objects.filter(status='PUBLISHED')
        total_projects_published = published_projects.count()

        from investments.models import Investment  # noqa: PLC0415
        from transactions.models import Transaction  # noqa: PLC0415

        total_volume = (
            Transaction.objects.filter(status='COMPLETED', transaction_type='INVESTMENT')
            .aggregate(total=models.Sum('amount'))
            .get('total')
            or 0
        )

        total_investors = (
            Investment.objects.filter(status='CONFIRMED').values('investor').distinct().count()
        )

        fully_funded = Project.objects.filter(
            status='PUBLISHED', pool__collected_amount__gte=F('pool__target_amount')
        ).count()
        success_rate = 0
        if total_projects_published > 0:
            success_rate = round((fully_funded / total_projects_published) * 100)

        return {
            'total_projects': total_projects_published,
            'total_investors': total_investors,
            'total_volume': float(total_volume),
            'success_rate': success_rate,
        }
