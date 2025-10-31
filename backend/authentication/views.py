from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.socialaccount.models import SocialAccount, SocialApp

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    Validates Google ID token and returns JWT tokens.

    Expected request body:
    {
        "id_token": "google_id_token_here"
    }

    Returns:
    {
        "access": "jwt_access_token",
        "refresh": "jwt_refresh_token",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    }
    """
    token = request.data.get('id_token')

    if not token:
        return Response(
            {'error': 'ID token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get Google client ID from settings
        google_client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']

        if not google_client_id:
            return Response(
                {'error': 'Google OAuth is not configured properly'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            google_client_id
        )

        # Token is valid, get user info
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        google_id = idinfo.get('sub')

        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'username': email,
            }
        )

        # Update user info if not created
        if not created:
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.save()

        # Get or create social account
        social_account, _ = SocialAccount.objects.get_or_create(
            user=user,
            provider='google',
            defaults={'uid': google_id}
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        # Invalid token
        return Response(
            {'error': f'Invalid token: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
