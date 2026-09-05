import decimal
import uuid
from datetime import timedelta
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from investments.models import Investment
from notifications.models import Notification
from payments.models import Payment
from pools.models import Pool
from projects.models import Project
from secondary_market.models import Listing
from transactions.models import Transaction
from users.models import KYCVerification, User


class Command(BaseCommand):
    help = 'Seed the database with realistic test data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')

        now = timezone.now()

        investors = []
        investor_data = [
            ('alice', 'alice@test.com', 'Alice', 'Martin'),
            ('bob', 'bob@test.com', 'Bob', 'Dupont'),
            ('carol', 'carol@test.com', 'Carol', 'Bernard'),
            ('david', 'david@test.com', 'David', 'Petit'),
            ('emma', 'emma@test.com', 'Emma', 'Moreau'),
        ]
        for uname, email, first, last in investor_data:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'role': 'INVESTOR',
                    'is_verified': True,
                    'phone': f'+336{str(len(investors) + 10).zfill(8)}',
                },
            )
            if created:
                u.set_password('Test1234!')
                u.save()
            investors.append(u)

        owners = []
        owner_data = [
            ('techstart', 'techstart@test.com', 'Tech', 'Start'),
            ('greenenergy', 'greenenergy@test.com', 'Green', 'Energy'),
            ('finnova', 'finnova@test.com', 'Fin', 'Nova'),
        ]
        for uname, email, first, last in owner_data:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'role': 'PROJECT_OWNER',
                    'is_verified': True,
                    'phone': f'+336{str(len(owners) + 50).zfill(8)}',
                },
            )
            if created:
                u.set_password('Test1234!')
                u.save()
            owners.append(u)

        insurer, _ = User.objects.get_or_create(
            username='insurer1',
            defaults={
                'email': 'insurer@test.com',
                'first_name': 'Assureur',
                'last_name': 'Pro',
                'role': 'INSURER',
                'is_verified': True,
            },
        )
        if _:
            insurer.set_password('Test1234!')
            insurer.save()

        for inv in investors:
            KYCVerification.objects.get_or_create(
                user=inv,
                defaults={
                    'id_document': ContentFile(b'fake-doc', name=f'{inv.username}_id.pdf'),
                    'status': 'APPROVED',
                    'reviewed_at': now,
                    'reviewed_by': insurer,
                },
            )

        projects_data = [
            (
                owners[0],
                'AI-Powered Health Diagnostics',
                'Revolutionary AI platform for early disease detection using medical imaging. Targets hospitals and clinics across Europe.',
                'Technology',
                'LOW',
                'PUBLISHED',
                500000,
                24,
                8.5,
            ),
            (
                owners[0],
                'Smart Urban Farming Hub',
                'Vertical farming facility in downtown Paris using IoT sensors and renewable energy. Organic produce for local restaurants.',
                'Agriculture',
                'MEDIUM',
                'PUBLISHED',
                200000,
                18,
                10.0,
            ),
            (
                owners[1],
                'Solar Panel Leasing Program',
                'Residential solar panel leasing with guaranteed ROI. Partnership with major French housing cooperatives.',
                'Energy',
                'LOW',
                'PUBLISHED',
                1000000,
                36,
                7.5,
            ),
            (
                owners[1],
                'Electric Vehicle Charging Network',
                'Fast-charging stations along major French highways. Revenue-sharing model with highway operators.',
                'Energy',
                'MEDIUM',
                'PUBLISHED',
                750000,
                30,
                9.0,
            ),
            (
                owners[2],
                'Fintech Micro-Lending Platform',
                'Digital platform providing micro-loans to SMEs in underserved regions. AI-driven credit scoring.',
                'Finance',
                'HIGH',
                'PUBLISHED',
                300000,
                12,
                12.0,
            ),
            (
                owners[2],
                'Blockchain Supply Chain',
                'Blockchain-based supply chain tracking for luxury goods. Anti-counterfeit verification system.',
                'Technology',
                'HIGH',
                'PUBLISHED',
                400000,
                20,
                11.0,
            ),
            (
                owners[0],
                'Biotech Research Lab',
                'Early-stage biotech research into novel antibiotic compounds. High risk, high potential return.',
                'Healthcare',
                'HIGH',
                'PENDING',
                600000,
                36,
                15.0,
            ),
            (
                owners[1],
                'Eco-Tourism Resort',
                'Sustainable eco-tourism resort in the French Alps. Carbon-neutral construction and operations.',
                'Tourism',
                'MEDIUM',
                'DRAFT',
                800000,
                48,
                8.0,
            ),
            (
                owners[2],
                'Cybersecurity SaaS',
                'Enterprise cybersecurity platform with real-time threat detection. B2B subscription model.',
                'Technology',
                'LOW',
                'REJECTED',
                250000,
                18,
                9.5,
            ),
            (
                owners[0],
                'MedTech Wearable',
                'Next-gen health monitoring wearable device with FDA compliance pathway.',
                'Healthcare',
                'MEDIUM',
                'CLOSED',
                350000,
                24,
                10.5,
            ),
        ]

        projects = []
        for owner, title, desc, cat, risk, status, target, dur, ret in projects_data:
            p, _ = Project.objects.get_or_create(
                title=title,
                defaults={
                    'owner': owner,
                    'description': desc,
                    'risk_type': risk,
                    'category': cat,
                    'target_amount': target,
                    'duration_months': dur,
                    'risk_level': risk,
                    'expected_return': ret,
                    'status': status,
                    'image': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
                },
            )
            projects.append(p)

        pools = []
        pool_configs = [
            (0, 500000, 50000, 500, 150000),
            (1, 200000, 40000, 250, 80000),
            (2, 1000000, 200000, 1000, 350000),
            (3, 750000, 150000, 750, 200000),
            (4, 300000, 60000, 300, 120000),
            (5, 400000, 80000, 400, 160000),
        ]
        for idx, target, _min_inv, min_amt, collected in pool_configs:
            p = projects[idx]
            pool, _ = Pool.objects.get_or_create(
                project=p,
                defaults={
                    'target_amount': target,
                    'collected_amount': collected,
                    'minimum_investment': min_amt,
                    'start_date': now - timedelta(days=30),
                    'end_date': now + timedelta(days=180),
                    'status': 'OPEN',
                },
            )
            pools.append(pool)

        investments = []
        inv_configs = [
            (0, investors[0], 10000, 'CONFIRMED'),
            (0, investors[1], 8000, 'CONFIRMED'),
            (0, investors[2], 12000, 'CONFIRMED'),
            (1, investors[0], 5000, 'CONFIRMED'),
            (1, investors[3], 7000, 'CONFIRMED'),
            (2, investors[1], 15000, 'CONFIRMED'),
            (2, investors[4], 10000, 'CONFIRMED'),
            (3, investors[2], 8000, 'CONFIRMED'),
            (4, investors[3], 6000, 'CONFIRMED'),
            (5, investors[4], 9000, 'CONFIRMED'),
            (0, investors[3], 4000, 'PENDING'),
            (2, investors[0], 3000, 'CANCELLED'),
        ]
        for pool_idx, investor, amount, status in inv_configs:
            inv, _ = Investment.objects.get_or_create(
                investor=investor,
                pool=pools[pool_idx],
                amount=amount,
                defaults={
                    'status': status,
                    'confirmed_at': now - timedelta(days=20) if status == 'CONFIRMED' else None,
                },
            )
            investments.append(inv)

        for inv in investments:
            if inv.status in ('CONFIRMED', 'PENDING'):
                method = ['CARD', 'BANK_TRANSFER', 'WALLET'][investments.index(inv) % 3]
                pay_status = 'SUCCESS' if inv.status == 'CONFIRMED' else 'PENDING'
                Payment.objects.get_or_create(
                    investment=inv,
                    defaults={
                        'user': inv.investor,
                        'amount': inv.amount,
                        'method': method,
                        'status': pay_status,
                        'reference': f'PAY-{uuid.uuid4().hex[:12].upper()}',
                    },
                )

        for inv in investments:
            if inv.status == 'CONFIRMED':
                Transaction.objects.get_or_create(
                    reference=f'TXN-{uuid.uuid4().hex[:12].upper()}',
                    defaults={
                        'user': inv.investor,
                        'investment': inv,
                        'transaction_type': 'INVESTMENT',
                        'amount': inv.amount,
                        'status': 'COMPLETED',
                        'description': f'Investment in {inv.pool.project.title}',
                    },
                )

        if investments[0].status == 'CONFIRMED':
            Listing.objects.get_or_create(
                investment=investments[0],
                defaults={
                    'seller': investments[0].investor,
                    'price': decimal.Decimal('11000'),
                    'status': 'ACTIVE',
                },
            )
        if investments[3].status == 'CONFIRMED':
            Listing.objects.get_or_create(
                investment=investments[3],
                defaults={
                    'seller': investments[3].investor,
                    'price': decimal.Decimal('5500'),
                    'status': 'ACTIVE',
                },
            )

        notif_data = [
            (
                investors[0],
                'INVESTMENT',
                'Investment Confirmed',
                'Your investment of 10,000 EUR in AI-Powered Health Diagnostics has been confirmed.',
            ),
            (
                investors[1],
                'PAYMENT',
                'Payment Received',
                'Payment of 8,000 EUR received for Smart Urban Farming Hub.',
            ),
            (
                investors[0],
                'PROJECT',
                'Project Published',
                'Your project "AI-Powered Health Diagnostics" has been published and is now visible to investors.',
            ),
            (
                investors[2],
                'SYSTEM',
                'KYC Approved',
                'Your KYC verification has been approved. You can now invest.',
            ),
            (
                investors[3],
                'MARKET',
                'Investment Listed',
                'Your investment in Solar Panel Leasing has been listed on the secondary market.',
            ),
            (
                owners[0],
                'PROJECT',
                'New Investment',
                'A new investment of 12,000 EUR has been made in your project AI-Powered Health Diagnostics.',
            ),
            (
                owners[1],
                'PROJECT',
                'Pool Funded',
                'Your pool for Solar Panel Leasing Program has reached 35% of its target.',
            ),
            (
                investors[4],
                'TRANSACTION',
                'Transaction Complete',
                'Your transaction of 9,000 EUR has been completed successfully.',
            ),
        ]
        for user, ntype, title, msg in notif_data:
            Notification.objects.get_or_create(
                user=user,
                title=title,
                defaults={
                    'notification_type': ntype,
                    'message': msg,
                    'is_read': False,
                },
            )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!\n'))
        self.stdout.write('Test accounts:\n')
        self.stdout.write('  Admin:      testadmin / Test1234!')
        self.stdout.write('  Insurer:    insurer1 / Test1234!')
        self.stdout.write('  Owners:     techstart, greenenergy, finnova / Test1234!')
        self.stdout.write('  Investors:  alice, bob, carol, david, emma / Test1234!')
        self.stdout.write('\nStats:')
        self.stdout.write(f'  Users:        {User.objects.count()}')
        self.stdout.write(f'  Projects:     {Project.objects.count()}')
        self.stdout.write(f'  Pools:        {Pool.objects.count()}')
        self.stdout.write(f'  Investments:  {Investment.objects.count()}')
        self.stdout.write(f'  Payments:     {Payment.objects.count()}')
        self.stdout.write(f'  Transactions: {Transaction.objects.count()}')
        self.stdout.write(f'  Listings:     {Listing.objects.count()}')
        self.stdout.write(f'  Notifications:{Notification.objects.count()}')
