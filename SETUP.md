# DRF React Base - Setup Guide

This is a complete application with Django Rest Framework backend and React frontend, featuring authentication with both email/password and Google OAuth.

## Architecture

### Backend
- **Framework**: Django Rest Framework
- **Authentication**: Django Allauth with Headless support
- **Database**: SQLite (development)
- **Features**:
  - Email/Password authentication
  - Google OAuth integration
  - Session-based authentication
  - REST API endpoints

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Features**:
  - Login/Signup pages
  - Protected routes
  - Session management
  - Google OAuth integration

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Create superuser (optional)
```bash
python manage.py createsuperuser
```

### 6. Configure Google OAuth (optional)

To enable Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/api/auth/_allauth/browser/v1/auth/provider/callback`
6. Copy Client ID and Client Secret

Then, either:

**Option A: Via Django Admin**
1. Run the server: `python manage.py runserver`
2. Go to http://localhost:8000/admin/
3. Navigate to "Sites" and update example.com to `localhost:8000`
4. Navigate to "Social applications" and add a new application:
   - Provider: Google
   - Name: Google OAuth
   - Client ID: [Your Client ID]
   - Secret key: [Your Client Secret]
   - Sites: Select localhost:8000

**Option B: Via Django Shell**
```bash
python manage.py shell
```
```python
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Update site
site = Site.objects.get_current()
site.domain = 'localhost:8000'
site.name = 'localhost:8000'
site.save()

# Create social app
social_app = SocialApp.objects.create(
    provider='google',
    name='Google OAuth',
    client_id='YOUR_CLIENT_ID',
    secret='YOUR_CLIENT_SECRET',
)
social_app.sites.add(site)
```

### 7. Run the development server
```bash
python manage.py runserver
```

Backend will be available at http://localhost:8000

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## Testing the Application

1. Start both backend and frontend servers
2. Navigate to http://localhost:5173
3. You'll be redirected to the login page
4. Try:
   - Creating a new account with email/password
   - Logging in with email/password
   - Logging in with Google (if configured)

## API Endpoints

The backend exposes the following endpoints via Django Allauth Headless:

- `POST /api/auth/_allauth/browser/v1/auth/login` - Login with email/password
- `POST /api/auth/_allauth/browser/v1/auth/signup` - Signup with email/password
- `DELETE /api/auth/_allauth/browser/v1/auth/session` - Logout
- `GET /api/auth/_allauth/browser/v1/auth/session` - Get current session
- `GET /api/auth/_allauth/browser/v1/auth/provider/redirect` - Get OAuth provider URL
- `POST /api/auth/_allauth/browser/v1/auth/provider/token` - Handle OAuth callback

## Project Structure

```
drf-react-base/
├── backend/
│   ├── accounts/              # Django app for accounts
│   ├── config/                # Django project settings
│   │   ├── settings.py        # Main settings file
│   │   └── urls.py            # URL configuration
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Home.jsx
│   │   │   └── Home.css
│   │   ├── services/          # API services
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Key Features Implemented

1. **Email/Password Authentication**
   - User registration
   - User login
   - Session management

2. **Google OAuth**
   - Seamless redirect flow
   - Automatic account creation
   - Session management

3. **Protected Routes**
   - Automatic redirect to login for unauthenticated users
   - Session persistence
   - Loading states

4. **REST API**
   - Django Allauth Headless endpoints
   - CORS configured for localhost
   - CSRF protection

## Troubleshooting

### CORS Issues
- Ensure backend is running on port 8000
- Ensure frontend is running on port 5173 or 3000
- Check CORS_ALLOWED_ORIGINS in backend/config/settings.py

### Google OAuth Not Working
- Verify Client ID and Secret are correct
- Check redirect URIs in Google Cloud Console
- Ensure Site domain is set correctly in Django admin

### Session Not Persisting
- Check browser cookies are enabled
- Verify CORS_ALLOW_CREDENTIALS is True
- Check SESSION_COOKIE_SAMESITE settings

## Next Steps

- Add email verification
- Implement password reset
- Add user profile management
- Deploy to production
- Add more OAuth providers (Facebook, GitHub, etc.)
- Implement refresh tokens
- Add unit tests

## License

MIT
