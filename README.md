Team Task Manager (Full Stack)

A production-ready full-stack task management application with role-based access control (RBAC), built using modern technologies and designed for real-world deployment.

 Tech Stack
 Frontend
React 18 + Vite
Tailwind CSS
React Router
Axios

 Backend
Python (Flask)
Flask-PyMongo (MongoDB integration)
Marshmallow (validation)
JWT Authentication
 
Database
MongoDB Atlas (NoSQL)

 Authentication
JWT (JSON Web Tokens)
Password hashing (Werkzeug)

 Project Structure
team-task-manager/
│
├── backend/
│   ├── app.py
│   ├── extensions.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── middleware/
│   │   └── auth.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   └── users.py
│   └── utils/
│       └── helpers.py
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        ├── context/
        ├── components/
        └── pages/

 Environment Variables
 Backend (backend/.env)
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET_KEY=your_secret_key
 Frontend (frontend/.env)
VITE_API_URL=http://localhost:5000
 Getting Started
 1. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
python app.py

 Backend runs on:

http://localhost:5000
 2. Frontend Setup
cd frontend
npm install
npm run dev

 Frontend runs on:

http://localhost:5173
 API Endpoints
 Auth — /auth
Method	Endpoint	Description
POST	/auth/signup	Register user
POST	/auth/login	Login user
GET	/auth/me	Get current user
 Projects — /projects
Method	Endpoint	Access
GET	/projects/	All users
POST	/projects/	Admin
PUT	/projects/:id	Admin
DELETE	/projects/:id	Admin
 Tasks — /tasks
Method	Endpoint	Access
GET	/tasks/	All
POST	/tasks/	Admin
PUT	/tasks/:id	Admin / Assigned
DELETE	/tasks/:id	Admin
 Users — /users
Method	Endpoint	Description
GET	/users/	List users
 Role-Based Access Control (RBAC)
Feature	Admin	Member
Create projects	
Assign tasks	
Update task status		Own only
View tasks	All	Assigned only
 Database Design (MongoDB)
users
name
email
password
role
projects
title
description
created_by
tasks
title
status
project_id
assigned_to
due_date
 Deployment
 Backend
Railway
 Frontend
Vercel
