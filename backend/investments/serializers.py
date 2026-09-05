from .models import Investment
from rest_framework import serializers


class InvestmentSerializer(serializers.ModelSerializer):
    investor_username = serializers.CharField(source='investor.username', read_only=True)

    user = serializers.IntegerField(source='investor_id', read_only=True)

    project = serializers.SerializerMethodField()
    project_detail = serializers.SerializerMethodField()
    project_title = serializers.CharField(source='pool.project.title', read_only=True)

    pool_remaining_amount = serializers.DecimalField(
        source='pool.remaining_amount', max_digits=12, decimal_places=2, read_only=True
    )

    expected_return = serializers.SerializerMethodField()
    current_value = serializers.SerializerMethodField()
    performance = serializers.SerializerMethodField()

    class Meta:
        model = Investment

        fields = [
            'id',
            'user',
            'investor',
            'investor_username',
            'pool',
            'project',
            'project_title',
            'project_detail',
            'amount',
            'expected_return',
            'current_value',
            'performance',
            'status',
            'pool_remaining_amount',
            'created_at',
            'updated_at',
            'confirmed_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'investor',
            'investor_username',
            'project',
            'project_title',
            'project_detail',
            'expected_return',
            'current_value',
            'performance',
            'status',
            'pool_remaining_amount',
            'created_at',
            'updated_at',
            'confirmed_at',
        ]

    def _get_project(self, obj):
        if not obj.pool:
            return None
        return obj.pool.project

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
            'duration_months': project.duration_months,
            'expected_return': float(project.expected_return),
        }

    def get_expected_return(self, obj):
        project = self._get_project(obj)
        if not project:
            return 0
        return float(project.expected_return)

    def get_current_value(self, obj):
        if obj.status == 'CONFIRMED':
            return float(obj.amount)
        return 0

    def get_performance(self, obj):
        project = self._get_project(obj)
        if not project or obj.status != 'CONFIRMED':
            return 0
        try:
            return float(project.expected_return)
        except Exception:
            return 0

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Investment amount must be greater than 0.')

        return value

    def validate(self, data):

        pool = data.get('pool')
        amount = data.get('amount')

        if not pool:
            raise serializers.ValidationError({'pool': 'Pool is required.'})

        if not amount:
            raise serializers.ValidationError({'amount': 'Amount is required.'})

        if pool.status != 'OPEN':
            raise serializers.ValidationError({'pool': 'This pool is not open for investments.'})

        if amount < pool.minimum_investment:
            raise serializers.ValidationError(
                {'amount': (f"Le montant minimum d'investissement est {pool.minimum_investment}.")}
            )

        if amount > pool.remaining_amount:
            raise serializers.ValidationError(
                {
                    'amount': (
                        f'Le montant demandé dépasse le montant restant '
                        f'du pool ({pool.remaining_amount}).'
                    )
                }
            )

        return data
