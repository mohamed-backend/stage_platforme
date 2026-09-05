from .models import Pool
from django.contrib import admin


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'target_amount',
        'collected_amount',
        'minimum_investment',
        'start_date',
        'end_date',
        'status',
    )

    list_filter = (
        'status',
        'start_date',
        'end_date',
    )

    search_fields = ('project__title',)
