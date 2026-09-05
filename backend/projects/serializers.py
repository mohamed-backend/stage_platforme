from .models import Project
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    collected_amount = serializers.SerializerMethodField()
    minimum_investment = serializers.SerializerMethodField()
    pool = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = [
            'id',
            'owner',
            'owner_username',
            'title',
            'description',
            'risk_type',
            'category',
            'image',
            'target_amount',
            'collected_amount',
            'minimum_investment',
            'expected_return',
            'duration_months',
            'risk_level',
            'status',
            'pool',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'owner',
            'owner_username',
            'collected_amount',
            'minimum_investment',
            'pool',
            'status',
            'created_at',
            'updated_at',
        ]

    def _get_pool(self, obj):
        return getattr(obj, 'pool', None)

    def get_collected_amount(self, obj):
        pool = self._get_pool(obj)
        if pool is None:
            return 0
        return float(pool.collected_amount)

    def get_minimum_investment(self, obj):
        pool = self._get_pool(obj)
        if pool is None:
            return 0
        return float(pool.minimum_investment)

    def get_pool(self, obj):
        pool = self._get_pool(obj)
        if pool is None:
            return None
        return {
            'id': pool.id,
            'project': pool.project_id,
            'project_title': pool.project.title,
            'target_amount': float(pool.target_amount),
            'collected_amount': float(pool.collected_amount),
            'remaining_amount': float(pool.remaining_amount),
            'funding_percentage': float(pool.funding_percentage),
            'minimum_investment': float(pool.minimum_investment),
            'start_date': pool.start_date,
            'end_date': pool.end_date,
            'status': pool.status,
            'created_at': pool.created_at,
            'updated_at': pool.updated_at,
        }
