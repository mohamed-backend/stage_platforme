from .models import Claim, ClaimNote
from django.contrib import admin


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'claimant', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'claim_type')
    search_fields = ('title', 'description', 'claimant__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ClaimNote)
class ClaimNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'claim', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal',)
    search_fields = ('content',)
    readonly_fields = ('created_at',)
