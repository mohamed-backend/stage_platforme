# payments/serializers.py

from .models import Payment
from rest_framework import serializers


class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.IntegerField(source='user_id', read_only=True)
    confirmed_at = serializers.SerializerMethodField()
    investment_detail = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'investment',
            'investment_detail',
            'amount',
            'method',
            'status',
            'reference',
            'confirmed_at',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'amount',
            'status',
            'reference',
            'confirmed_at',
            'created_at',
            'updated_at',
        ]

    def get_confirmed_at(self, obj):
        inv = getattr(obj, 'investment', None)
        return getattr(inv, 'confirmed_at', None) if inv else None

    def get_investment_detail(self, obj):
        inv = getattr(obj, 'investment', None)
        if not inv:
            return None
        return {
            'id': inv.id,
            'amount': float(inv.amount),
            'status': inv.status,
            'project': inv.pool.project_id if inv.pool else None,
            'project_title': inv.pool.project.title if inv.pool and inv.pool.project else None,
        }
