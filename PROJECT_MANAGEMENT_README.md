# Project Management App - MVP

A full-stack agile project management application with Django REST Framework backend and React frontend.

## Features

### Backend (Django REST Framework)
- **Projects**: Create and manage projects with team members
- **Sprints**: Time-boxed iterations with planning, active, and completed states
- **Tasks**: Full CRUD operations with drag-and-drop kanban board
- **Comments**: Collaborate on tasks with threaded discussions
- **Permissions**: Role-based access control for project members and owners

### Frontend (React)
- **Dashboard**: View all projects with stats and active sprints
- **Kanban Board**: Drag-and-drop task management across 4 columns (Backlog, Implementing, Testing, Deployed)
- **Sprint Management**: Create, activate, and complete sprints
- **Task Details**: Full task editing with comments
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Django 5.2+
- Django REST Framework 3.16+
- django-filter for filtering
- django-allauth for authentication
- PostgreSQL/SQLite database
- JWT authentication

### Frontend
- React 18+
- React Router for navigation
- @dnd-kit for drag-and-drop
- Axios for API calls
- date-fns for date handling

## Getting Started

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter django-allauth google-auth python-decouple psycopg2-binary cffi
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create a superuser:
```bash
python manage.py createsuperuser
```

4. Start the development server:
```bash
python manage.py runserver
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

### Projects
- `GET /api/projects/` - List all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `POST /api/projects/{id}/add-member/` - Add member to project
- `DELETE /api/projects/{id}/remove-member/{user_id}/` - Remove member

### Sprints
- `GET /api/sprints/` - List sprints (filter by project_id)
- `POST /api/sprints/` - Create sprint
- `GET /api/sprints/{id}/` - Get sprint details
- `PUT /api/sprints/{id}/` - Update sprint
- `DELETE /api/sprints/{id}/` - Delete sprint
- `PATCH /api/sprints/{id}/set_active/` - Set sprint as active
- `PATCH /api/sprints/{id}/complete/` - Complete sprint

### Tasks
- `GET /api/tasks/` - List tasks (filter by project_id, sprint_id, status, priority, assigned_to)
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `PATCH /api/tasks/{id}/` - Partial update task
- `DELETE /api/tasks/{id}/` - Delete task
- `PATCH /api/tasks/{id}/move/` - Move task (change status/order)

### Comments
- `GET /api/comments/` - List comments (filter by task_id)
- `POST /api/comments/` - Create comment
- `PUT /api/comments/{id}/` - Update comment
- `DELETE /api/comments/{id}/` - Delete comment

## Data Models

### Project
- name, description
- owner (User ForeignKey)
- members (User ManyToMany)
- created_at, updated_at

### Sprint
- name, start_date, end_date
- status: planning, active, completed
- goal (optional)
- project (ForeignKey)

### Task
- title, description
- status: backlog, implementing, testing, deployed
- priority: low, medium, high
- story_points (optional)
- order (for kanban positioning)
- project, sprint (optional), assigned_to, created_by

### Comment
- text
- task (ForeignKey)
- user (ForeignKey)

## User Workflows

### 1. Create Project
1. Login to the app
2. Click "New Project" on dashboard
3. Fill in project name and description
4. Project is created with you as owner

### 2. Create and Start Sprint
1. Navigate to project board
2. Click "Manage Sprints"
3. Create new sprint with dates and goal
4. Click "Set Active" to start the sprint

### 3. Manage Tasks on Kanban Board
1. View project board with 4 columns
2. Click "+ Add Task" in any column
3. Fill in task details (title, description, priority, story points)
4. Drag tasks between columns to update status
5. Click on task card to view details, add comments, or edit

### 4. Complete Sprint
1. Go to Sprint Management
2. Click "Complete Sprint" on active sprint
3. Unfinished tasks automatically move to backlog

## Permissions

- **Project Owner**: Full control over project, members, and settings
- **Project Member**: Can view project, create/edit tasks, add comments
- **Task Creator**: Can edit their own tasks
- **Task Assignee**: Can edit tasks assigned to them
- **Comment Owner**: Can edit/delete their own comments

## Future Enhancements (Not in MVP)

- Burndown charts and velocity metrics
- Time tracking
- File attachments
- Email notifications
- Activity log
- Subtasks and dependencies
- Custom task statuses
- Labels/tags
- Calendar view
- Advanced reporting
- Dark mode

## Development Notes

- The app uses JWT tokens for authentication
- Tokens are automatically refreshed on expiry
- CORS is configured for localhost development
- Django admin panel available at `/admin/`
- All API endpoints require authentication except login/register

## License

MIT License
