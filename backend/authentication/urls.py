from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import google_login

urlpatterns = [
    # dj-rest-auth endpoints (email/password login, logout, user info)
    path('', include('dj_rest_auth.urls')),

    # Registration endpoints (signup)
    path('registration/', include('dj_rest_auth.registration.urls')),

    # Google OAuth login
    path('google/', google_login, name='google_login'),

    # JWT token refresh (already included in dj-rest-auth, but keeping explicit)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
