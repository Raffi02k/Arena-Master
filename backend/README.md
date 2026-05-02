# Arena-Master Backend 🐍
FastAPI backend with JWT authentication and SQLite.

## SETUP
1. **Create Virtual Environment**: `python3 -m venv venv`
2. **Activate**: `source venv/bin/activate`
3. **Install Dependencies**: `pip install -r requirements.txt`
4. **Seed Database**: `python -m app.seed` (Adds test data and user)
5. **Run Server**: `uvicorn app.main:app --reload --port 8000`

## API Documentation
Once running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for the Swagger UI.
