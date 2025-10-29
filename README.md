# drf-react-base

A complete full-stack application with Django Rest Framework (Backend) + React (Frontend) + Social Authentication.

## Features

### Backend
- Django Rest Framework for API endpoints
- Django Allauth with Headless support for authentication
- Email/Password authentication
- Google OAuth integration
- Session-based authentication
- CORS configured for frontend

### Frontend
- React with Vite for fast development
- React Router for navigation
- Axios for API communication
- Protected routes
- Seamless Google OAuth flow
- Email/Password login and signup

## Quick Start

For detailed setup instructions, see [SETUP.md](SETUP.md)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then navigate to http://localhost:5173

## Architecture

The application follows a modern architecture:
- **Backend**: REST API using Django Rest Framework with Django Allauth headless endpoints
- **Frontend**: Single Page Application (SPA) built with React
- **Authentication**: Session-based authentication with support for email/password and Google OAuth
- **Communication**: Frontend communicates with backend via REST API calls

## Requirements Met

All initial requirements have been implemented:

**Frontend:**
- ✓ Written in React
- ✓ Seamless Google login - user clicks "Login with Google", frontend communicates with backend, redirects to OAuth page, and logs in on successful return
- ✓ Both email/password and Google login options available

**Backend:**
- ✓ Coded in Django Rest Framework
- ✓ Allauth used to handle login
- ✓ AllAuth headless views implemented for REST endpoints

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- Backend API runs on http://localhost:8000
- Frontend runs on http://localhost:5173

## License

MIT
