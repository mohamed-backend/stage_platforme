from .models import CoverageRule, InsurerReport
from rest_framework import serializers


class CoverageRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoverageRule
        fields = [
            'id',
            'name',
            'description',
            'max_coverage',
            'premium_rate',
            'risk_levels',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InsurerReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(
        source='generated_by.username', read_only=True, allow_null=True
    )

    class Meta:
        model = InsurerReport
        fields = [
            'id',
            'title',
            'report_type',
            'data',
            'generated_by',
            'generated_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'generated_by', 'generated_by_name', 'created_at']
