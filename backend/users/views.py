from .models import KYCVerification
from .serializers import (
    KYCReviewSerializer,
    KYCSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services import KYCService, UserService
from django.conf import settings
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


@extend_schema(
    tags=['Users'],
    summary='Register a new user',
    description='Register a new user as INVESTOR or PROJECT_OWNER',
    request=RegisterSerializer,
    responses={201: UserSerializer, 400: OpenApiResponse(description='Validation error')},
)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Users'],
    summary='Get current user profile',
    responses={200: UserSerializer, 401: OpenApiResponse(description='Unauthorized')},
)
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Users'],
    summary='Logout user (blacklist refresh token)',
    request={'type': 'object', 'properties': {'refresh': {'type': 'string'}}},
    responses={
        205: OpenApiResponse(description='Successfully logged out'),
        400: OpenApiResponse(description='Invalid refresh token'),
    },
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'detail': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT
            )

        except (KeyError, TokenError):
            return Response(
                {'detail': 'Invalid or missing refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


@extend_schema(
    tags=['Users'],
    summary='Submit KYC document',
    request=KYCSerializer,
    responses={
        201: KYCSerializer,
        400: OpenApiResponse(description='KYC already exists or validation error'),
        401: OpenApiResponse(description='Unauthorized'),
    },
)
class KYCSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = KYCSerializer(data=request.data)

        if serializer.is_valid():
            kyc, error = KYCService.submit_kyc(request.user, request.data.get('id_document'))

            if error:
                return Response(
                    {'detail': error},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(KYCSerializer(kyc).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):

        if not hasattr(request.user, 'kyc'):
            return Response({'detail': 'No KYC document found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = KYCSerializer(request.user.kyc)
        return Response(serializer.data)


@extend_schema(
    tags=['Users'],
    summary='Review KYC document (Admin/Insurer only)',
    request=KYCReviewSerializer,
    responses={
        200: KYCSerializer,
        403: OpenApiResponse(description='Forbidden - Admin/Insurer only'),
        404: OpenApiResponse(description='KYC not found'),
    },
)
class KYCReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        if request.user.role not in ['ADMIN', 'INSURER']:
            return Response(
                {'detail': 'Admin or Insurer role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            kyc = KYCVerification.objects.select_related('user').get(pk=pk)
        except KYCVerification.DoesNotExist:
            return Response({'detail': 'KYC document not found.'}, status=status.HTTP_404_NOT_FOUND)

        if kyc.user == request.user:
            return Response(
                {'detail': 'You cannot review your own KYC document.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = KYCReviewSerializer(kyc, data=request.data, partial=True)

        if serializer.is_valid():
            new_status = serializer.validated_data.get('status')
            rejection_reason = serializer.validated_data.get('rejection_reason', '')

            kyc = KYCService.review_kyc(
                kyc, request.user, new_status, rejection_reason=rejection_reason
            )

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Users'],
    summary='Request password reset',
    description='Send password reset email to user',
    request={'type': 'object', 'properties': {'email': {'type': 'string', 'format': 'email'}}},
    responses={
        200: OpenApiResponse(description='Password reset email sent'),
        400: OpenApiResponse(description='Validation error'),
    },
)
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        UserService.request_password_reset(email, frontend_url=settings.FRONTEND_URL)

        return Response(
            {'detail': 'If this email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=['Users'],
    summary='Confirm password reset',
    description='Reset password using token from email',
    request={
        'type': 'object',
        'properties': {
            'uid': {'type': 'string'},
            'token': {'type': 'string'},
            'new_password': {'type': 'string', 'minLength': 8},
            'confirm_password': {'type': 'string'},
        },
        'required': ['uid', 'token', 'new_password', 'confirm_password'],
    },
    responses={
        200: OpenApiResponse(description='Password reset successful'),
        400: OpenApiResponse(description='Invalid token or validation error'),
    },
)
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([uid, token, new_password, confirm_password]):
            return Response(
                {'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'detail': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        success, message = UserService.confirm_password_reset(uid, token, new_password)

        if not success:
            return Response(
                {'detail': message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({'detail': 'Password reset successful.'}, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Users'],
    summary='Public platform statistics',
    description='Aggregated, non-sensitive stats for the marketing landing page',
    responses={200: OpenApiResponse(description='Public stats payload')},
)
class PublicStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from projects.services import ProjectService  # noqa: PLC0415

        stats = ProjectService.get_public_stats()
        return Response(stats)
