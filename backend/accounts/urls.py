from django.urls import path
from .views import GoogleAuthView, CurrentUserView

urlpatterns = [
    path('google/', GoogleAuthView.as_view(), name='google_auth'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
]
