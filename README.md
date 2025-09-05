# Research Website

A full-stack web application with FastAPI backend and React frontend.

## Project Structure

```
RESEARCH_WEBSITE/
├── backend/                 # FastAPI application
│   ├── api/
│   │   └── endpoints/
│   ├── models/
│   ├── .env
│   ├── config.py
│   └── main.py
├── frontend/                # React application
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm

## Backend Setup (FastAPI)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Environment setup:**
   - Copy `.env.example` to `.env`
   - Update environment variables as needed

5. **Run the backend:**

   ```bash
   uvicorn main:app --reload --port 8000 # Preferred
   ```

   or

    ```
    python main.py
    ```

   Backend will be served at: http://localhost:8000
   
## Frontend Setup (React + Vite)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be served at: http://localhost:5173

## Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

- `[GET, POST, PATCH, DELETE, PUT] - /` - Health check

## Environment Variables

### Backend

### Frontend


## Development Notes

- Backend runs on port 8000
- Frontend runs on port 5173
- Hot reload is enabled for both services



