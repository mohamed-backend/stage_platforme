from .models import Claim, ClaimNote
from .serializers import ClaimNoteSerializer, ClaimReviewSerializer, ClaimSerializer
from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _is_reviewer(user):
    return user.is_authenticated and user.role in ['INSURER', 'ADMIN']


@extend_schema(
    tags=['Claims'],
    summary='List claims',
    description='Investors see their own claims. Insurers/Admins see all claims.',
    responses={200: ClaimSerializer(many=True)},
)
class ClaimListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if _is_reviewer(request.user):
            queryset = Claim.objects.all().select_related('claimant', 'assigned_to', 'investment')
        else:
            queryset = Claim.objects.filter(claimant=request.user).select_related(
                'claimant', 'assigned_to', 'investment'
            )

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = ClaimSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='Submit a new claim',
        request=ClaimSerializer,
        responses={
            201: ClaimSerializer,
            400: OpenApiResponse(description='Validation error'),
            403: OpenApiResponse(description='Forbidden'),
        },
    )
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ClaimSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(claimant=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Claims'],
    summary='Claim detail / update / delete',
    responses={
        200: ClaimSerializer,
        403: OpenApiResponse(description='Forbidden'),
        404: OpenApiResponse(description='Not found'),
    },
)
class ClaimDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Claim.objects.select_related('claimant', 'assigned_to', 'investment').get(pk=pk)
        except Claim.DoesNotExist:
            return None

    def _can_access(self, claim, user):
        return _is_reviewer(user) or (claim.claimant_id == user.id)

    def get(self, request, pk):
        claim = self.get_object(pk)
        if not claim:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not self._can_access(claim, request.user):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(ClaimSerializer(claim).data)

    def delete(self, request, pk):
        claim = self.get_object(pk)
        if not claim:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)
        if claim.claimant_id != request.user.id and not _is_reviewer(request.user):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        if claim.status not in ['SUBMITTED']:
            return Response(
                {'detail': 'A claim in progress cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        claim.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=['Claims'],
    summary='Review a claim (Insurer/Admin only)',
    request=ClaimReviewSerializer,
    responses={
        200: ClaimSerializer,
        403: OpenApiResponse(description='Forbidden - Insurer/Admin only'),
        404: OpenApiResponse(description='Not found'),
    },
)
class ClaimReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not _is_reviewer(request.user):
            return Response(
                {'detail': 'Action reserved for Insurer or Admin.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            claim = Claim.objects.get(pk=pk)
        except Claim.DoesNotExist:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClaimReviewSerializer(claim, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data.get('status')
        if new_status in ['APPROVED', 'REJECTED', 'PAID', 'CLOSED']:
            claim.resolved_at = timezone.now()

        serializer.save()
        return Response(ClaimSerializer(claim).data)


@extend_schema(
    tags=['Claims'],
    summary='Add a note to a claim',
    request=ClaimNoteSerializer,
    responses={
        201: ClaimNoteSerializer,
        403: OpenApiResponse(description='Forbidden'),
        404: OpenApiResponse(description='Not found'),
    },
)
class ClaimNoteCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            claim = Claim.objects.get(pk=pk)
        except Claim.DoesNotExist:
            return Response({'detail': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_reviewer = _is_reviewer(request.user)
        is_owner = claim.claimant_id == request.user.id
        if not (is_reviewer or is_owner):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content')
        if not content:
            return Response(
                {'detail': 'Note content is required.'}, status=status.HTTP_400_BAD_REQUEST
            )

        is_internal = bool(request.data.get('is_internal', False))
        if is_internal and not is_reviewer:
            return Response(
                {'detail': 'Only insurers/admins can create internal notes.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        note = ClaimNote.objects.create(
            claim=claim, author=request.user, content=content, is_internal=is_internal
        )
        return Response(ClaimNoteSerializer(note).data, status=status.HTTP_201_CREATED)
