# Students Tracker Backend

Express + MongoDB backend for the Students Tracker frontend.

## Setup

1. Install dependencies:
   npm install
2. Create env file:
   copy .env.example .env
3. Update `.env` values if needed.
4. Start dev server:
   npm run dev

Server default URL: `http://localhost:5000`

## Environment Variables

- `PORT` (default: `5000`)
- `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/students-tracker`)
- `CLIENT_ORIGIN` (default frontend origin for CORS, e.g. `http://localhost:5173`)

## API Endpoints

### Health
- `GET /api/health`

### User
- `GET /api/user`
- `PUT /api/user`
  - body: `{ "name": "Mahim" }`

### Full Frontend State (same shape as localStorage)
- `GET /api/state`
- `PUT /api/state`
  - body:
    {
      "user": { "name": "Mahim" },
      "goals": {
        "2026-03-20": [{ "id": "1", "text": "React" }]
      },
      "reflections": {
        "2026-03-20": {
          "goals": [{ "goalId": "1", "text": "Done", "hours": 2.5 }],
          "extra": { "text": "Revision", "hours": 1 },
          "submitted": false
        }
      }
    }

### Day-level CRUD
- `GET /api/days/:dateKey`
- `PUT /api/days/:dateKey`
- `POST /api/days/:dateKey/goals`
- `PATCH /api/days/:dateKey/goals/:goalId`
- `DELETE /api/days/:dateKey/goals/:goalId`
- `PATCH /api/days/:dateKey/reflection`
- `PATCH /api/days/:dateKey/submit`
