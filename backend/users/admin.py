from .models import KYCVerification, User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            'Informations supplémentaires',
            {
                'fields': (
                    'role',
                    'phone',
                    'is_verified',
                )
            },
        ),
    )

    list_display = (
        'username',
        'email',
        'role',
        'is_verified',
        'is_active',
    )

    list_filter = (
        'role',
        'is_verified',
        'is_active',
    )


@admin.register(KYCVerification)
class KYCVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
    )
    list_filter = ('status',)
