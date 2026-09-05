# payments/views.py

from .serializers import PaymentSerializer
from .services import PaymentService
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=['Payments'],
    summary='Create a payment',
    request=PaymentSerializer,
    responses={
        201: PaymentSerializer,
        400: OpenApiResponse(description='Validation error'),
        404: OpenApiResponse(description='Investment not found'),
    },
)
class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        investment_id = request.data.get('investment_id')
        method = request.data.get('method')

        if not investment_id:
            return Response(
                {'detail': 'investment_id is required.'}, status=status.HTTP_400_BAD_REQUEST
            )

        if not method:
            return Response(
                {'detail': 'payment method is required.'}, status=status.HTTP_400_BAD_REQUEST
            )

        payment, error = PaymentService.create_payment(request.user, investment_id, method)

        if error:
            status_code = (
                status.HTTP_404_NOT_FOUND
                if 'not found' in error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Payments'],
    summary='List own payments',
    responses={200: PaymentSerializer(many=True)},
)
class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = PaymentService.get_user_payments(request.user)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Payments'],
    summary='Get payment detail',
    responses={
        200: PaymentSerializer,
        404: OpenApiResponse(description='Payment not found'),
    },
)
class PaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        payment = PaymentService.get_payment_detail(payment_id, request.user)

        if not payment:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)


@extend_schema(
    tags=['Payments'],
    summary='Confirm a payment',
    responses={
        200: PaymentSerializer,
        400: OpenApiResponse(description='Cannot confirm'),
        404: OpenApiResponse(description='Payment not found'),
    },
)
class PaymentConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        payment, error = PaymentService.confirm_payment(payment_id, request.user)

        if error:
            status_code = (
                status.HTTP_404_NOT_FOUND
                if 'not found' in error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)
