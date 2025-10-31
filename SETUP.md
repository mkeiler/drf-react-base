# DRF React Authentication App - Setup Guide

This guide will help you set up and run the Django REST Framework + React authentication application.

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- Google Cloud Console account (for OAuth setup)

## Backend Setup (Django)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 6. Run database migrations

```bash
python manage.py migrate
```

### 7. Create a superuser (optional, for admin access)

```bash
python manage.py createsuperuser
```

### 8. Run the development server

```bash
python manage.py runserver
```

The backend should now be running at `http://localhost:8000`

## Frontend Setup (React)

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000/api/auth
```

**Note:** The `REACT_APP_GOOGLE_CLIENT_ID` must match the one used in the backend.

### 4. Run the development server

```bash
npm start
```

The frontend should now be running at `http://localhost:3000`

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"

### 2. Configure OAuth Consent Screen

1. Click on "OAuth consent screen" in the left sidebar
2. Choose "External" user type
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact email
4. Add scopes: `email` and `profile`
5. Save and continue

### 3. Create OAuth 2.0 Client ID

1. Go to "Credentials" tab
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
6. Click "Create"
7. Copy the Client ID and Client Secret

### 4. Update Environment Variables

Add the Client ID and Client Secret to:
- `backend/.env` (both CLIENT_ID and CLIENT_SECRET)
- `frontend/.env` (only CLIENT_ID)

## Testing Email/Password Authentication

### Create a test user via Django Admin

1. Make sure the backend is running
2. Go to `http://localhost:8000/admin`
3. Log in with your superuser credentials
4. Navigate to "Users"
5. Click "Add User"
6. Enter email and password
7. Save the user

### Or use the registration endpoint (if enabled)

Make a POST request to `http://localhost:8000/api/auth/registration/`:

```json
{
  "email": "test@example.com",
  "password1": "securepassword123",
  "password2": "securepassword123"
}
```

## Running the Full Application

1. Open two terminal windows
2. In terminal 1, start the backend:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python manage.py runserver
   ```
3. In terminal 2, start the frontend:
   ```bash
   cd frontend
   npm start
   ```
4. Open your browser to `http://localhost:3000`
5. Try logging in with:
   - Google OAuth (click "Sign in with Google")
   - Email/Password (use a created user account)

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/login/` - Email/password login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/google/` - Google OAuth login
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/user/` - Get current user info

## Troubleshooting

### CORS Errors

Make sure the backend's `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL.

### Google OAuth Errors

- Verify that the Client ID in both frontend and backend `.env` files match
- Check that the authorized origins in Google Cloud Console are correct
- Make sure you're using `http://localhost:3000` (not `127.0.0.1`)

### JWT Token Issues

If you're getting authentication errors:
- Clear your browser's localStorage
- Check that the token is being included in request headers
- Verify the SECRET_KEY is the same across requests

### Database Errors

If you encounter database errors:
- Delete `db.sqlite3` and run migrations again
- Make sure all migrations are applied: `python manage.py migrate`

## Production Deployment

### Backend

1. Set `DEBUG=False` in production
2. Use a production database (PostgreSQL recommended)
3. Set a strong `SECRET_KEY`
4. Configure proper `ALLOWED_HOSTS`
5. Use a production WSGI server (gunicorn, uwsgi)
6. Set up HTTPS

### Frontend

1. Build the React app: `npm run build`
2. Serve the build folder with a web server (nginx, Apache)
3. Update `REACT_APP_API_URL` to point to production backend
4. Update Google OAuth authorized origins and redirect URIs

## License

This project is open source and available under the MIT License.
