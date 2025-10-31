# App Django Rest Framework (Backend) + React (Frontend) + Social Auth

## Architecture Overview
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Django REST Framework API
- **Authentication**: Django AllAuth with headless/API mode for SPA

## Frontend Requirements

### Technology
- Must be written in **React**
- SPA architecture (no server-side rendering)

### Authentication Flow (User Experience)
The login must be **seamless** for the user:

1. **Google OAuth Login**:
   - User clicks "Login with Google" button on the login page
   - Frontend initiates OAuth flow using Google's JavaScript SDK
   - User is redirected to Google's consent screen
   - After Google authentication, user is automatically logged into the app
   - NO intermediate redirect pages visible to user

2. **Email/Password Login**:
   - Traditional form with email and password fields
   - Direct API call to backend
   - Immediate login upon success

### Requirements
- Login page with TWO options:
  - "Login with Google" button (OAuth)
  - Email/Password form (traditional)
- Store authentication tokens (JWT or session) in frontend
- Protect routes requiring authentication
- Handle token refresh automatically

## Backend Requirements

### Technology Stack
- **Django REST Framework** (DRF)
- **Django AllAuth** for authentication
- **CRITICAL**: Use AllAuth **Headless Mode** (allauth.headless) since this is a REST API

### Authentication Configuration
- Configure AllAuth in **headless/API mode** (NOT template-based)
- Support both authentication methods:
  1. Google OAuth2 (social authentication)
  2. Email/Password (local authentication)

### API Endpoints Needed
```
POST /api/auth/login/          # Email/password login
POST /api/auth/google/         # Google OAuth login (receive token from frontend)
POST /api/auth/logout/         # Logout
POST /api/auth/refresh/        # Refresh access token
GET  /api/auth/user/           # Get current user info
POST /api/auth/register/       # User registration (optional)
```

### Important Implementation Notes
- **DO NOT** use Django's template-based OAuth redirect flow
- **DO NOT** create redirect URLs like `/accounts/google/login/callback/`
- The OAuth flow happens **entirely in the frontend** using Google's JavaScript SDK
- Backend receives the **id_token** from frontend and validates it
- Backend creates/authenticates user and returns JWT tokens
- Use `dj-rest-auth` with `allauth` for easier headless implementation

### Required Packages
```
djangorestframework
django-allauth
dj-rest-auth[with_social]
djangorestframework-simplejwt  # for JWT tokens
google-auth                     # for validating Google tokens
```

## Key Architecture Point
⚠️ **CRITICAL**: This is a **decoupled architecture**:
- Frontend handles the OAuth popup/redirect with Google
- Frontend sends the resulting token to backend
- Backend validates token and returns authentication tokens
- NO server-side redirects for OAuth flow

## Example Flow for Google Login
1. User clicks "Login with Google" (Frontend)
2. Google OAuth popup appears (Frontend - using @react-oauth/google)
3. User authenticates with Google (Google's page)
4. Google returns id_token to frontend (Frontend)
5. Frontend sends id_token to `POST /api/auth/google/` (Frontend → Backend)
6. Backend validates token with Google servers (Backend)
7. Backend creates/retrieves user and returns JWT tokens (Backend → Frontend)
8. Frontend stores tokens and redirects to dashboard (Frontend)
