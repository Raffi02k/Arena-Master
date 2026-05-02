# Arena-Master 🏆
Arena-Master is a powerful, user-friendly tournament management platform. It allows users to create, manage, and track sports or gaming tournaments with ease.

## Features
- **Multiple Formats**: Supports Single Elimination, Double Elimination (League Single/Double), and Swiss System.
- **Team Management**: Easily seed and manage participating teams.
- **Match Tracking**: Real-time match scoring and status updates.
- **Automated Standings**: Dynamic calculation of league tables and Swiss standings (including Buchholz/Sonneborn-Berger).
- **Responsive UI**: A modern, dark-themed interface built with React and Tailwind CSS.
- **Secure Architecture**: FastAPI backend with local JWT authentication for personal data persistence.

## Project Structure
- **/backend**: FastAPI (Python) server with JWT authentication and SQLite database.
- **/frontend**: React + Vite + TypeScript frontend with Tailwind CSS.

## Getting Started

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python -m app.seed        # Initialize database with test user
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Login (Local Development)
- **Email**: `test@example.com`
- **Password**: `password123`

## Docker Compose
```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

Compose starts both services and runs the backend seed script automatically.
