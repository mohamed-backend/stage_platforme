from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('investments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Claim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('claim_type', models.CharField(choices=[
                    ('PROJECT_FAILURE', 'Défaillance projet'),
                    ('PAYMENT_ISSUE', 'Problème de paiement'),
                    ('PLATFORM_ISSUE', 'Problème plateforme'),
                    ('OTHER', 'Autre'),
                ], default='OTHER', max_length=30)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('amount_claimed', models.DecimalField(blank=True, decimal_places=2, help_text='Montant réclamé (si applicable)', max_digits=12, null=True)),
                ('status', models.CharField(choices=[
                    ('SUBMITTED', 'Soumise'),
                    ('UNDER_REVIEW', 'En cours de revue'),
                    ('APPROVED', 'Approuvée'),
                    ('REJECTED', 'Rejetée'),
                    ('PAID', 'Indemnisée'),
                    ('CLOSED', 'Clôturée'),
                ], default='SUBMITTED', max_length=20)),
                ('priority', models.CharField(choices=[('LOW', 'Faible'), ('MEDIUM', 'Moyenne'), ('HIGH', 'Élevée')], default='MEDIUM', max_length=10)),
                ('resolution_note', models.TextField(blank=True, default='', help_text="Note de résolution fournie par l'assureur/admin")),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='claims_assigned', to=settings.AUTH_USER_MODEL)),
                ('claimant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='claims_filed', to=settings.AUTH_USER_MODEL)),
                ('investment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='claims', to='investments.investment')),
            ],
            options={
                'verbose_name': 'Réclamation',
                'verbose_name_plural': 'Réclamations',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ClaimNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_internal', models.BooleanField(default=False, help_text='Note interne (assureur/admin uniquement)')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='claim_notes', to=settings.AUTH_USER_MODEL)),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='claims.claim')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]