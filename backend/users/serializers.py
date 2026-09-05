from .models import KYCVerification, User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    password_confirm = serializers.CharField(write_only=True)

    role = serializers.ChoiceField(
        choices=[
            ('INVESTOR', 'Investor'),
            ('PROJECT_OWNER', 'Project Owner'),
        ]
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
            'password',
            'password_confirm',
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate(self, data):

        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})

        return data

    def create(self, validated_data):

        validated_data.pop('password_confirm')

        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        return user


class UserSerializer(serializers.ModelSerializer):
    kyc_status = serializers.CharField(read_only=True)

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone',
            'is_verified',
            'is_active',
            'kyc_status',
            'date_joined',
            'last_login',
        ]

        read_only_fields = [
            'id',
            'role',
            'is_verified',
            'is_active',
            'kyc_status',
            'date_joined',
            'last_login',
        ]


class AdminUserPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
            'is_verified',
            'is_active',
            'is_staff',
            'is_superuser',
        ]
        read_only_fields = ['is_staff', 'is_superuser']


class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCVerification
        fields = [
            'id',
            'id_document',
            'status',
            'rejection_reason',
            'submitted_at',
            'reviewed_at',
        ]

        read_only_fields = [
            'id',
            'status',
            'rejection_reason',
            'submitted_at',
            'reviewed_at',
        ]


class KYCReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCVerification
        fields = ['status', 'rejection_reason']

    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError('Status must be APPROVED or REJECTED.')
        return value
