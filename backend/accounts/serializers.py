from rest_framework import serializers
from django.contrib.auth import get_user_model
# from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object"""

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


# class RegisterSerializer(BaseRegisterSerializer):
#     """Custom register serializer"""
#     first_name = serializers.CharField(required=False, allow_blank=True)
#     last_name = serializers.CharField(required=False, allow_blank=True)

#     def get_cleaned_data(self):
#         data = super().get_cleaned_data()
#         data['first_name'] = self.validated_data.get('first_name', '')
#         data['last_name'] = self.validated_data.get('last_name', '')
#         return data


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth authentication"""
    id_token = serializers.CharField(required=True)

    def validate_id_token(self, value):
        """Validate Google ID token"""
        try:
            client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            if not client_id:
                raise serializers.ValidationError("Google OAuth is not configured")

            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                value,
                requests.Request(),
                client_id
            )

            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Invalid token issuer')

            return idinfo

        except ValueError as e:
            raise serializers.ValidationError(f'Invalid token: {str(e)}')

    def create(self, validated_data):
        """Create or get user from Google token"""
        idinfo = validated_data['id_token']
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
            }
        )

        return user
