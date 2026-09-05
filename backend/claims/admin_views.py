from .models import Claim
from .serializers import ClaimReviewSerializer, ClaimSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


@extend_schema(
    tags=['Claims - Admin'],
    summary='List all claims (Admin only)',
    responses={200: ClaimSerializer(many=True), 403: OpenApiResponse(description='Admin only')},
)
class AdminClaimListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        claims = Claim.objects.all().select_related('claimant', 'assigned_to', 'investment')
        serializer = ClaimSerializer(claims, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=['Claims - Admin'],
    summary='Get claim detail (Admin only)',
    responses={
        200: ClaimSerializer,
        403: OpenApiResponse(description='Admin only'),
        404: OpenApiResponse(description='Claim not found'),
    },
)
class AdminClaimDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, claim_id):
        try:
            claim = Claim.objects.select_related('claimant', 'assigned_to', 'investment').get(
                pk=claim_id
            )
        except Claim.DoesNotExist:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClaimSerializer(claim)
        return Response(serializer.data)

    def patch(self, request, claim_id):
        try:
            claim = Claim.objects.get(pk=claim_id)
        except Claim.DoesNotExist:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClaimReviewSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ClaimSerializer(claim).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, claim_id):
        try:
            claim = Claim.objects.get(pk=claim_id)
        except Claim.DoesNotExist:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        claim.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
