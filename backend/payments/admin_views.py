from .models import Payment
from .serializers import PaymentSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


class AdminPaymentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        payments = (
            Payment.objects.all()
            .select_related('user', 'investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class AdminPaymentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.select_related(
                'user', 'investment', 'investment__pool', 'investment__pool__project'
            ).get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(payment)
        return Response(serializer.data)

    def patch(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(payment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
