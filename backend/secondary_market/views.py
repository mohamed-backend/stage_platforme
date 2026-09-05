# secondary_market/views.py

from .serializers import ListingSerializer
from .services import ListingService
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ListingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        investment_id = request.data.get('investment_id')
        price = request.data.get('price')

        if not investment_id or not price:
            return Response(
                {'detail': 'investment_id and price are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing, error = ListingService.create_listing(request.user, investment_id, price)

        if error:
            status_code = (
                status.HTTP_404_NOT_FOUND
                if 'not found' in error.lower() or 'introuvable' in error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)


class ListingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = ListingService.get_market_listings(request.user)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)


class MyListingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = ListingService.get_user_listings(request.user)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)


class ListingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing, error = ListingService.cancel_listing(listing_id, request.user)

        if error:
            status_code = (
                status.HTTP_404_NOT_FOUND
                if 'not found' in error.lower() or 'introuvable' in error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(ListingSerializer(listing).data)


class ListingBuyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing, error = ListingService.buy_listing(listing_id, request.user)

        if error:
            if (
                'kyc' in error.lower()
                or 'investor' in error.lower()
                or 'investisseur' in error.lower()
            ):
                status_code = status.HTTP_403_FORBIDDEN
            elif 'not found' in error.lower() or 'introuvable' in error.lower():
                status_code = status.HTTP_404_NOT_FOUND
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            return Response(
                {'detail': error},
                status=status_code,
            )

        return Response(ListingSerializer(listing).data, status=status.HTTP_200_OK)
