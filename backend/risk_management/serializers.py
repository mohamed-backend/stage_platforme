from .models import RiskAssessment
from rest_framework import serializers


class RiskAssessmentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    risk_score = serializers.FloatField(source='score', read_only=True, default=0)
    risk_level = serializers.CharField(source='level', read_only=True, default='MEDIUM')
    probability = serializers.SerializerMethodField()
    impact = serializers.SerializerMethodField()
    explanation = serializers.SerializerMethodField()
    model_version = serializers.SerializerMethodField()

    class Meta:
        model = RiskAssessment
        fields = [
            'id',
            'project',
            'project_title',
            'risk_score',
            'risk_level',
            'probability',
            'impact',
            'explanation',
            'model_version',
            'factors',
            'assessed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'project_title',
            'risk_score',
            'risk_level',
            'probability',
            'impact',
            'explanation',
            'model_version',
            'factors',
            'created_at',
            'updated_at',
        ]

    def get_probability(self, obj):
        if isinstance(obj.factors, dict):
            return float(obj.factors.get('probability', 0))
        return 0

    def get_impact(self, obj):
        if isinstance(obj.factors, dict):
            return float(obj.factors.get('impact', 0))
        return 0

    def get_explanation(self, obj):
        if isinstance(obj.factors, dict):
            return obj.factors.get('explanation', '')
        return ''

    def get_model_version(self, obj):
        if isinstance(obj.factors, dict):
            return obj.factors.get('model_version', 'placeholder-v1')
        return 'placeholder-v1'
