from .models import Investment
from .serializers import InvestmentSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


class AdminInvestmentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        investments = (
            Investment.objects.all()
            .select_related('investor', 'pool', 'pool__project')
            .order_by('-created_at')
        )
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)


class AdminInvestmentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, investment_id):
        try:
            investment = Investment.objects.select_related('investor', 'pool', 'pool__project').get(
                id=investment_id
            )
        except Investment.DoesNotExist:
            return Response({'detail': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)

    def patch(self, request, investment_id):
        try:
            investment = Investment.objects.get(id=investment_id)
        except Investment.DoesNotExist:
            return Response({'detail': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InvestmentSerializer(investment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, investment_id):
        try:
            investment = Investment.objects.get(id=investment_id)
        except Investment.DoesNotExist:
            return Response({'detail': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)

        investment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
