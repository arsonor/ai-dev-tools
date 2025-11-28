# Django Todo Application

A simple and clean todo application built with Django and managed with uv.

## Features

- Create, edit, and delete todos
- Assign due dates to tasks
- Mark todos as resolved/unresolved
- Clean and responsive UI
- Django admin integration for advanced management

## Requirements

- Python 3.10 or higher
- uv package manager

## Installation & Setup

1. Install dependencies using uv:
```bash
uv sync
```

2. Run database migrations:
```bash
uv run python manage.py migrate
```

3. (Optional) Create a superuser for admin access:
```bash
uv run python manage.py createsuperuser
```

4. Start the development server:
```bash
uv run python manage.py runserver
```

5. Open your browser and navigate to:
   - Main app: http://localhost:8000/
   - Admin panel: http://localhost:8000/admin/

## Usage

### Main Interface

- **View Todos**: The home page displays all your todos with their status, due dates, and timestamps
- **Create Todo**: Click the "New Todo" button to create a new task
- **Edit Todo**: Click the "Edit" button on any todo to modify it
- **Delete Todo**: Click the "Delete" button to remove a todo (with confirmation)
- **Toggle Status**: Click "Resolve" or "Unresolve" to mark a todo as complete or active

### Admin Interface

Access the Django admin panel at `/admin/` to manage todos with additional features like filtering, searching, and batch operations.

## Project Structure

```
01-todo-app/
├── todos/                  # Main app
│   ├── models.py          # Todo model definition
│   ├── views.py           # View functions for CRUD operations
│   ├── urls.py            # URL routing
│   ├── admin.py           # Admin configuration
│   └── templates/         # HTML templates
│       └── todos/
│           ├── base.html
│           ├── todo_list.html
│           ├── todo_form.html
│           └── todo_confirm_delete.html
├── todoproject/           # Project settings
│   ├── settings.py
│   └── urls.py
└── manage.py              # Django management script
```

## Model Fields

- **title**: Task title (required)
- **description**: Detailed description (optional)
- **due_date**: Target completion date (optional)
- **resolved**: Boolean flag for completion status
- **created_at**: Timestamp of creation
- **updated_at**: Timestamp of last modification
