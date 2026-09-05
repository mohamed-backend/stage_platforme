from .models import Claim, ClaimNote
from rest_framework import serializers


class ClaimNoteSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True, default=None)

    class Meta:
        model = ClaimNote
        fields = [
            'id',
            'claim',
            'author',
            'author_username',
            'is_internal',
            'content',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'claim',
            'author',
            'author_username',
            'created_at',
        ]


class ClaimSerializer(serializers.ModelSerializer):
    claimant_username = serializers.CharField(source='claimant.username', read_only=True)

    assigned_to_username = serializers.CharField(
        source='assigned_to.username', read_only=True, default=None
    )

    notes = ClaimNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id',
            'claimant',
            'claimant_username',
            'investment',
            'claim_type',
            'title',
            'description',
            'amount_claimed',
            'status',
            'priority',
            'assigned_to',
            'assigned_to_username',
            'resolution_note',
            'resolved_at',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'claimant',
            'claimant_username',
            'assigned_to_username',
            'status',
            'assigned_to',
            'resolution_note',
            'resolved_at',
            'notes',
            'created_at',
            'updated_at',
        ]


class ClaimReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['status', 'priority', 'assigned_to', 'resolution_note']

    def validate_status(self, value):
        allowed = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CLOSED']
        if value not in allowed:
            raise serializers.ValidationError(
                f'Statut invalide. Valeurs autorisées : {", ".join(allowed)}.'
            )
        return value
