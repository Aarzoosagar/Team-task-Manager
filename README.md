#  Team Task Manager (Full Stack)

A production-ready full-stack task management application with **role-based access control (RBAC)**, built using modern technologies and designed for real-world deployment.

---

##  Tech Stack

###  Frontend
- React 18 + Vite  
- Tailwind CSS  
- React Router  
- Axios  

###  Backend
- Python (Flask)  
- Flask-PyMongo (MongoDB integration)  
- Marshmallow (validation)  
- JWT Authentication  

###  Database
- MongoDB Atlas (NoSQL)

###  Authentication
- JWT (JSON Web Tokens)  
- Password hashing (Werkzeug)

---

##  Project Structure

team-task-manager/
│
├── backend/
│ ├── app.py
│ ├── extensions.py
│ ├── requirements.txt
│ ├── Procfile
│ ├── middleware/
│ │ └── auth.py
│ ├── routes/
│ │ ├── auth.py
│ │ ├── projects.py
│ │ ├── tasks.py
│ │ └── users.py
│ └── utils/
│ └── helpers.py
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


---

##  Environment Variables

###  Backend (`backend/.env`)

###  Frontend (`frontend/.env`)


---

##  Getting Started

###  Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
python app.py