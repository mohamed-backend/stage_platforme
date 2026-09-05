from .models import User
from .serializers import AdminUserPatchSerializer, UserSerializer
from django.core.cache import cache
from django.db.models import Count, Q, Sum
from investments.models import Investment
from notifications.models import Notification
from payments.models import Payment
from projects.models import Project
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from secondary_market.models import Listing
from transactions.models import Transaction
from users.permissions import IsAdmin


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        cache_key = 'admin_dashboard_stats'
        stats = cache.get(cache_key)
        if not stats:
            user_agg = User.objects.aggregate(
                total=Count('id'),
                investor=Count('id', filter=Q(role='INVESTOR')),
                project_owner=Count('id', filter=Q(role='PROJECT_OWNER')),
                insurer=Count('id', filter=Q(role='INSURER')),
                admin=Count('id', filter=Q(role='ADMIN')),
            )

            project_agg = Project.objects.aggregate(
                total=Count('id'),
                draft=Count('id', filter=Q(status='DRAFT')),
                pending=Count('id', filter=Q(status='PENDING')),
                published=Count('id', filter=Q(status='PUBLISHED')),
                rejected=Count('id', filter=Q(status='REJECTED')),
                closed=Count('id', filter=Q(status='CLOSED')),
            )

            investment_agg = Investment.objects.aggregate(
                total=Count('id'),
                pending=Count('id', filter=Q(status='PENDING')),
                confirmed=Count('id', filter=Q(status='CONFIRMED')),
                cancelled=Count('id', filter=Q(status='CANCELLED')),
                refunded=Count('id', filter=Q(status='REFUNDED')),
            )

            transaction_agg = Transaction.objects.aggregate(
                total=Count('id'),
                total_volume=Sum('amount', filter=Q(status='COMPLETED')),
            )

            payments_count = Payment.objects.count()
            listings_count = Listing.objects.count()
            notifications_count = Notification.objects.count()

            total_volume = float(transaction_agg.get('total_volume') or 0)

            stats = {
                'total_users': user_agg['total'],
                'total_projects': project_agg['total'],
                'total_investments': investment_agg['total'],
                'total_payments': payments_count,
                'total_transactions': transaction_agg['total'],
                'total_listings': listings_count,
                'total_notifications': notifications_count,
                'total_volume': total_volume,
                'projects_by_status': {
                    'DRAFT': project_agg['draft'],
                    'PENDING': project_agg['pending'],
                    'PUBLISHED': project_agg['published'],
                    'REJECTED': project_agg['rejected'],
                    'CLOSED': project_agg['closed'],
                },
                'investments_by_status': {
                    'PENDING': investment_agg['pending'],
                    'CONFIRMED': investment_agg['confirmed'],
                    'CANCELLED': investment_agg['cancelled'],
                    'REFUNDED': investment_agg['refunded'],
                },
                'users_by_role': {
                    'INVESTOR': user_agg['investor'],
                    'PROJECT_OWNER': user_agg['project_owner'],
                    'INSURER': user_agg['insurer'],
                    'ADMIN': user_agg['admin'],
                },
            }
            cache.set(cache_key, stats, timeout=300)

        return Response(stats)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserPatchSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
