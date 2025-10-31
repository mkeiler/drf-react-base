# Setup Guide

This guide will walk you through setting up and running the Django REST Framework + React application with social authentication.

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ and npm installed
- Google OAuth credentials (optional, for Google login)

## Project Structure

```
drf-react-base/
├── backend/           # Django REST Framework API
│   ├── config/        # Django settings
│   ├── accounts/      # Authentication app
│   ├── manage.py
│   └── requirements.txt
├── frontend/          # React SPA
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create and Activate Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Google OAuth (optional)
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Navigate to Frontend Directory

Open a new terminal window:

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Google OAuth Setup (Optional)

If you want to enable Google login:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if prompted
6. Select "Web application" as application type
7. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:8000`
8. Add authorized redirect URIs:
   - `http://localhost:5173`
9. Save and copy the Client ID and Client Secret

### 2. Configure Backend

Add to `backend/.env`:

```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

### 3. Configure Frontend

Add to `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Restart Both Servers

Restart both backend and frontend servers to apply the changes.

## Testing the Application

### 1. Create a Test User

#### Option A: Using Django Admin

1. Go to `http://localhost:8000/admin`
2. Login with superuser credentials
3. Create a new user with email and password

#### Option B: Using Registration API

```bash
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password1": "testpass123",
    "password2": "testpass123"
  }'
```

### 2. Test Email/Password Login

1. Open `http://localhost:5173`
2. You'll be redirected to the login page
3. Enter email and password
4. Click "Sign In"
5. You should be redirected to the dashboard

### 3. Test Google Login

1. Click "Login with Google" button
2. Select your Google account
3. Grant permissions
4. You should be automatically logged in and redirected to dashboard

## API Endpoints

### Authentication

- `POST /api/auth/login/` - Email/password login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/google/` - Google OAuth login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/user/` - Get current user info

### Admin

- `GET /admin/` - Django admin panel

## Technology Stack

### Backend

- Django 5.1.3
- Django REST Framework 3.15.2
- Django AllAuth 0.61.1 (headless mode)
- dj-rest-auth 7.0.0
- djangorestframework-simplejwt 5.4.0
- google-auth 2.36.0
- django-cors-headers 4.6.0

### Frontend

- React 18
- Vite (build tool)
- React Router 6
- Axios (API client)
- @react-oauth/google (Google OAuth)
- jwt-decode (JWT token handling)

## Architecture Highlights

### Decoupled Authentication

- Frontend handles OAuth popup/redirect with Google
- Frontend sends id_token to backend
- Backend validates token and returns JWT tokens
- No server-side redirects for OAuth flow

### JWT Authentication

- Access token (1 hour lifetime)
- Refresh token (7 days lifetime)
- Automatic token refresh on API calls
- Tokens stored in localStorage

### Protected Routes

- Dashboard and other protected routes require authentication
- Automatic redirect to login if not authenticated
- Loading state while checking authentication

## Troubleshooting

### Backend Issues

**CORS errors:**
- Verify `CORS_ALLOWED_ORIGINS` in backend `.env`
- Make sure frontend URL matches exactly

**Database errors:**
- Delete `db.sqlite3` and run migrations again
- `python manage.py migrate --run-syncdb`

**Google OAuth not working:**
- Verify credentials in backend `.env`
- Check OAuth consent screen configuration
- Ensure authorized origins include your frontend URL

### Frontend Issues

**Google login button not showing:**
- Verify `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
- Check browser console for errors

**API connection errors:**
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_BASE_URL` in frontend `.env`

**Build errors:**
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Production Deployment

Before deploying to production:

1. **Backend:**
   - Change `DEBUG=False`
   - Use strong `SECRET_KEY`
   - Configure production database (PostgreSQL recommended)
   - Set up proper ALLOWED_HOSTS
   - Enable HTTPS
   - Set `JWT_AUTH_HTTPONLY=True`
   - Configure email backend for password reset

2. **Frontend:**
   - Update `VITE_API_BASE_URL` to production backend URL
   - Update Google OAuth authorized origins and redirect URIs
   - Build for production: `npm run build`
   - Deploy `dist` folder to static hosting

3. **Google OAuth:**
   - Add production URLs to authorized origins
   - Update OAuth consent screen for production

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Django and React documentation
- Check Google OAuth documentation for OAuth-related issues
