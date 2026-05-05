# Team Task Manager

A production-ready full-stack web application with role-based access control (RBAC).

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios
- **Backend:** Python (Flask), SQLAlchemy ORM, Marshmallow validation
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt

---

## Folder Structure

```
team-task-manager/
├── backend/
│   ├── app.py                  # Flask app factory + config
│   ├── models.py               # SQLAlchemy models
│   ├── requirements.txt
│   ├── .env.example
│   ├── middleware/
│   │   └── auth.py             # JWT auth + role decorators
│   └── routes/
│       ├── auth.py             # /auth/signup, /auth/login, /auth/me
│       ├── projects.py         # /projects CRUD + members
│       ├── tasks.py            # /tasks CRUD + stats + filters
│       └── users.py            # /users list
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── axios.js        # Axios instance + interceptors
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useToast.js
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Modal.jsx
        │   ├── Toast.jsx
        │   ├── StatusTag.jsx
        │   ├── Avatar.jsx
        │   └── BarChart.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── ProjectsPage.jsx
            ├── TasksPage.jsx
            └── UsersPage.jsx
```

---

## Quick Start

### 1. PostgreSQL Setup

```sql
CREATE DATABASE taskmanager;
CREATE USER taskuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskuser;
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your DB credentials and a strong JWT_SECRET_KEY

python app.py
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5000

npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://taskuser:yourpassword@localhost:5432/taskmanager
JWT_SECRET_KEY=replace-with-64-char-random-string
FLASK_ENV=development
```

### Frontend `.env.local`
```
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### Auth — `/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | None | Register new user |
| POST | `/auth/login` | None | Login, receive JWT |
| GET | `/auth/me` | JWT | Get current user |

### Projects — `/projects`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects/` | JWT | List accessible projects |
| POST | `/projects/` | Admin | Create project |
| GET | `/projects/:id` | JWT | Get project details |
| PUT | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project + cascade |
| POST | `/projects/:id/members` | Admin | Add member |
| DELETE | `/projects/:id/members/:uid` | Admin | Remove member |

### Tasks — `/tasks`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks/` | JWT | List tasks (filterable) |
| POST | `/tasks/` | Admin | Create task |
| GET | `/tasks/stats` | JWT | Aggregated task stats |
| GET | `/tasks/:id` | JWT | Get task |
| PUT | `/tasks/:id` | JWT* | Update task (* members: status only) |
| DELETE | `/tasks/:id` | Admin | Delete task |

**Query params for `GET /tasks/`:** `status`, `project_id`, `search`, `overdue`, `page`, `per_page`

### Users — `/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/` | JWT | List all users |
| GET | `/users/:id` | JWT | Get user by ID |

---

## RBAC Summary

| Feature | Admin | Member |
|---------|-------|--------|
| Create/edit/delete projects | ✅ | ❌ |
| Manage project members | ✅ | ❌ |
| Create/assign/delete tasks | ✅ | ❌ |
| Update task status | ✅ | Own tasks only |
| View all projects | ✅ | Assigned projects only |
| View all tasks | ✅ | Assigned tasks only |
| View dashboard stats | All tasks | Own tasks |

---

## Database Schema (ERD)

```
users
  id PK, name, email (unique), password_hash, role, created_at

projects
  id PK, title, description, created_by FK→users.id, created_at, updated_at

project_members
  id PK, project_id FK→projects.id, user_id FK→users.id
  UNIQUE(project_id, user_id)

tasks
  id PK, title, description, status, due_date
  project_id FK→projects.id
  assigned_to FK→users.id (nullable)
  created_by FK→users.id
  created_at, updated_at
```

**Relationships:**
- User → Projects: one-to-many (creator)
- Project → Tasks: one-to-many (cascade delete)
- User ↔ Project: many-to-many via project_members
- User → Tasks: one-to-many (assigned_to)

---

## Demo Credentials (interactive preview)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Member | member@demo.com | member123 |
