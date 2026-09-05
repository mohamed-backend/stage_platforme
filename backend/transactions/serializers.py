# transactions/serializers.py

from .models import Transaction
from rest_framework import serializers


class TransactionSerializer(serializers.ModelSerializer):
    transaction_type = serializers.CharField(read_only=True)
    user = serializers.IntegerField(source='user_id', read_only=True)
    investment_detail = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'user',
            'investment',
            'investment_detail',
            'transaction_type',
            'amount',
            'status',
            'reference',
            'description',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'transaction_type',
            'amount',
            'status',
            'reference',
            'description',
            'created_at',
            'updated_at',
        ]

    def get_investment_detail(self, obj):
        if not obj.investment:
            return None
        inv = obj.investment
        return {
            'id': inv.id,
            'amount': float(inv.amount),
            'status': inv.status,
            'project': inv.pool.project_id if inv.pool else None,
            'project_title': inv.pool.project.title if inv.pool and inv.pool.project else None,
        }
