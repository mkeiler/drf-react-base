# React Frontend

This is the frontend SPA for the authentication application, built with React and Vite.

## Features

- React 18 with Vite
- React Router for navigation
- Google OAuth integration
- Email/password login
- JWT token management
- Automatic token refresh
- Protected routes
- Responsive design

## Setup

See the main [SETUP.md](../SETUP.md) file for detailed setup instructions.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run development server
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── LoginPage.jsx
│   │   ├── LoginPage.css
│   │   ├── DashboardPage.jsx
│   │   └── DashboardPage.css
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
└── vite.config.js
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Available Scripts

### `npm run dev`
Runs the development server at `http://localhost:5173`

### `npm run build`
Builds the app for production to the `dist` folder

### `npm run preview`
Preview the production build locally

### `npm run lint`
Run ESLint to check code quality

## Architecture

### Authentication Flow

1. **Login Page** (`/login`)
   - Google OAuth button
   - Email/password form
   - Redirects to dashboard on success

2. **Dashboard** (`/dashboard`)
   - Protected route (requires authentication)
   - Shows user information
   - Logout functionality

### Auth Context

`AuthContext` provides:
- `user` - Current user object
- `login(email, password)` - Email/password login
- `googleLogin(credentialResponse)` - Google OAuth login
- `logout()` - Logout function
- `isAuthenticated` - Boolean authentication status
- `loading` - Loading state

### API Service

Located in `src/services/api.js`:
- Axios instance with interceptors
- Automatic JWT token attachment
- Automatic token refresh on 401 errors
- Authentication API methods

### Protected Routes

Use `ProtectedRoute` component to protect routes:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## Adding New Features

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Use `ProtectedRoute` if authentication required

### Making API Calls

```javascript
import api from '../services/api';

// Authenticated request (automatically includes JWT token)
const response = await api.get('/api/some-endpoint/');

// Or use the api service directly
import { authAPI } from '../services/api';
const user = await authAPI.getCurrentUser();
```

## Styling

- Global styles in `index.css`
- Component-specific CSS files alongside components
- Responsive design with media queries

## Dependencies

Key dependencies:
- `react` & `react-dom` - React library
- `react-router-dom` - Routing
- `@react-oauth/google` - Google OAuth
- `axios` - HTTP client
- `jwt-decode` - JWT token decoding

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
