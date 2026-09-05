from .models import RiskAssessment
from django.contrib import admin


@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ('project', 'score', 'level', 'assessed_at', 'created_at')
    list_filter = ('level',)
    search_fields = ('project__title',)
    readonly_fields = ('created_at', 'updated_at')
