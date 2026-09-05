# transactions/views.py

from .models import Transaction
from .serializers import TransactionSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=['Transactions'],
    summary='List own transactions',
    responses={200: TransactionSerializer(many=True)},
)
class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request):

        transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(transactions, request, view=self)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TransactionSerializer(transactions, many=True)

        return Response(serializer.data)


@extend_schema(
    tags=['Transactions'],
    summary='Get transaction detail',
    responses={
        200: TransactionSerializer,
        404: OpenApiResponse(description='Transaction not found'),
    },
)
class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_id):

        try:
            transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TransactionSerializer(transaction)

        return Response(serializer.data)
