# secondary_market/serializers.py

from .models import Listing
from rest_framework import serializers


class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.IntegerField(source='seller_id', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    project = serializers.SerializerMethodField()
    project_detail = serializers.SerializerMethodField()
    investment_detail = serializers.SerializerMethodField()
    expected_return = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'seller',
            'seller_username',
            'investment',
            'investment_detail',
            'project',
            'project_detail',
            'price',
            'expected_return',
            'risk_level',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'seller',
            'seller_username',
            'project',
            'project_detail',
            'investment_detail',
            'expected_return',
            'risk_level',
            'status',
            'created_at',
            'updated_at',
        ]

    def _get_project(self, obj):
        if not obj.investment or not obj.investment.pool:
            return None
        return obj.investment.pool.project

    def get_project(self, obj):
        project = self._get_project(obj)
        return project.id if project else None

    def get_project_detail(self, obj):
        project = self._get_project(obj)
        if not project:
            return None
        return {
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'risk_level': project.risk_level,
            'expected_return': float(project.expected_return),
        }

    def get_investment_detail(self, obj):
        inv = getattr(obj, 'investment', None)
        if not inv:
            return None
        project = self._get_project(obj)
        return {
            'id': inv.id,
            'amount': float(inv.amount),
            'status': inv.status,
            'project': project.id if project else None,
            'project_title': project.title if project else None,
            'expected_return': float(project.expected_return) if project else 0,
        }

    def get_expected_return(self, obj):
        project = self._get_project(obj)
        if not project:
            return 0
        return float(project.expected_return)

    def get_risk_level(self, obj):
        project = self._get_project(obj)
        return project.risk_level if project else 'MEDIUM'
