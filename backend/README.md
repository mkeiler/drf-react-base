# Django REST Framework Backend

This is the backend API for the authentication application, built with Django REST Framework.

## Features

- Django REST Framework API
- JWT authentication with djangorestframework-simplejwt
- Email/password authentication
- Google OAuth2 authentication (headless mode)
- Django AllAuth in headless/API mode
- CORS configured for frontend communication
- Automatic token refresh

## Setup

See the main [SETUP.md](../SETUP.md) file for detailed setup instructions.

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

## API Endpoints

### Authentication

- `POST /api/auth/login/` - Login with email/password
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/logout/` - Logout (requires authentication)

- `POST /api/auth/registration/` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password1": "password123",
    "password2": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```

- `POST /api/auth/google/` - Google OAuth login
  ```json
  {
    "id_token": "google-id-token-here"
  }
  ```

- `POST /api/auth/token/refresh/` - Refresh JWT token
  ```json
  {
    "refresh": "refresh-token-here"
  }
  ```

- `GET /api/auth/user/` - Get current user info (requires authentication)

## Configuration

Key settings in `config/settings.py`:

- **CORS**: Configured to allow frontend origin
- **JWT**: Access token (1 hour), Refresh token (7 days)
- **AllAuth**: Headless mode, email authentication
- **Google OAuth**: Configured via environment variables

## Environment Variables

Create a `.env` file with:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
```

## Project Structure

```
backend/
├── config/              # Django project settings
│   ├── settings.py      # Main settings
│   ├── urls.py          # URL configuration
│   └── wsgi.py
├── accounts/            # Authentication app
│   ├── serializers.py   # API serializers
│   ├── views.py         # API views
│   └── urls.py          # App URLs
├── manage.py
└── requirements.txt
```

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Django Admin

Access at `http://localhost:8000/admin`

Create superuser:
```bash
python manage.py createsuperuser
```
