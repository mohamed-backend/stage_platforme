from .models import Project
from django.contrib import admin


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'owner',
        'risk_type',
        'target_amount',
        'duration_months',
        'risk_level',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'risk_level',
        'risk_type',
    )

    search_fields = (
        'title',
        'description',
        'owner__username',
    )
