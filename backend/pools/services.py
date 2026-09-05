# pools/services.py

"""Pool-related business logic services."""

from .models import Pool
from projects.models import Project


class PoolService:
    """Service for pool-related operations."""

    @staticmethod
    def create_pool(user, project_id, data):
        """Create a pool for a published project."""
        if user.role != 'PROJECT_OWNER':
            return None, 'Only the project owner can create a pool.'

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return None, 'Project not found.'

        if project.owner != user:
            return None, 'You are not the project owner.'

        if project.status != 'PUBLISHED':
            return None, 'Project must be published before creating a pool.'

        if hasattr(project, 'pool'):
            return None, 'This project already has a pool.'

        data_copy = dict(data)
        data_copy.pop('project', None)
        data_copy.pop('target_amount', None)

        pool = Pool.objects.create(
            project=project, target_amount=project.target_amount, **data_copy
        )

        return pool, None

    @staticmethod
    def get_open_pools():
        """Get all open pools for published projects."""
        return Pool.objects.filter(project__status='PUBLISHED', status='OPEN').select_related(
            'project'
        )

    @staticmethod
    def get_pool_detail(pool_id):
        """Get pool detail."""
        try:
            return Pool.objects.select_related('project').get(
                id=pool_id, project__status='PUBLISHED'
            )
        except Pool.DoesNotExist:
            return None

    @staticmethod
    def get_user_pools(user):
        """Get pools for user's projects."""
        if user.role != 'PROJECT_OWNER':
            return None, 'Only project owners can view their pools.'

        return Pool.objects.filter(project__owner=user).select_related('project'), None
