from .models import Listing
from .serializers import ListingSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin


class AdminListingListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        listings = (
            Listing.objects.all()
            .select_related('seller', 'investment', 'investment__pool', 'investment__pool__project')
            .order_by('-created_at')
        )
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)


class AdminListingDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, listing_id):
        try:
            listing = Listing.objects.select_related(
                'seller', 'investment', 'investment__pool', 'investment__pool__project'
            ).get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'detail': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListingSerializer(listing)
        return Response(serializer.data)

    def patch(self, request, listing_id):
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'detail': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListingSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, listing_id):
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'detail': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        listing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
