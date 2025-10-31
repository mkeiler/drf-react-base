from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import GoogleAuthSerializer, UserSerializer

User = get_user_model()


class GoogleAuthView(APIView):
    """
    View for Google OAuth authentication.
    Frontend sends the id_token from Google, backend validates and returns JWT tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = GoogleAuthSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Return tokens and user data
            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user': UserSerializer(user).data,
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveAPIView):
    """Get current authenticated user"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
