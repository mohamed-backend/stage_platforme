from .models import Transaction
from .serializers import TransactionSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


class AdminTransactionListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        transactions = (
            Transaction.objects.all()
            .select_related('user', 'investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class AdminTransactionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, transaction_id):
        try:
            transaction = Transaction.objects.select_related(
                'user', 'investment', 'investment__pool', 'investment__pool__project'
            ).get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    def patch(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
