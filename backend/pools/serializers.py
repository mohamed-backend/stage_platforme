from .models import Pool
from rest_framework import serializers


class PoolSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    funding_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Pool

        fields = [
            'id',
            'project',
            'project_title',
            'target_amount',
            'collected_amount',
            'remaining_amount',
            'funding_percentage',
            'minimum_investment',
            'start_date',
            'end_date',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'project_title',
            'collected_amount',
            'remaining_amount',
            'funding_percentage',
            'status',
            'created_at',
            'updated_at',
        ]

    def validate(self, data):
        start_date = data.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = data.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        return data
