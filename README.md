# Spaceborn Management System

Internal operations and employee management portal for tracking daily tasks, attendance, leave requests, and team performance.

##  Demo Accounts

The database comes pre-seeded with these test users:

| Employee ID | Password | Role | Name |
| :--- | :--- | :--- | :--- |
| `CEO001` | `admin123` | CEO | John Doe |
| `COO001` | `coo123` | COO | Aarav Mehta |
| `MGR001` | `manager123` | Manager | Jane Smith |
| `LD001` | `lead123` | Team Lead | Mike Johnson |
| `EMP001` | `member123` | Member / Employee | Ravi Das |
| `EMP002` | `member123` | Member / Employee | Priya Sharma |
| `HR001` | `hr123` | HR | Neha Gupta |

Log in using your Employee ID and password at the login screen.

## Features

- **Daily Work Reports:** Employees submit standup notes and blockers; managers review submissions filtered by date.
- **Task Management:** Create, assign, and track task progress across departments.
- **Attendance & Breaks:** Clock-in, clock-out, and break logging.
- **Leave Management:** Submit leave requests with balance tracking; manager and team lead approval flows.
- **Role-based Dashboards:** Dedicated views for CEO, COO, Managers, Team Leads, and Employees.
- **Database:** Uses embedded PostgreSQL (PGlite) locally so no database installation is needed. Automatically connects to PostgreSQL in production when `DATABASE_URL` is set.

## Running Locally

Requires Node.js 18 or higher.

### Run Production Build (Single Port)

Builds the React frontend and serves both the API and client from port 5000:

```bash
# Install dependencies and build frontend
npm run build

# Start the server
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Development Mode

Run backend and frontend separately with hot-reloading:

```bash
# Terminal 1 - Backend API (port 5000)
npm run dev:backend

# Terminal 2 - React Dev Server (port 3000)
npm run dev:frontend
```

## Deployment (Render)

This project can be deployed as a unified web service with a managed PostgreSQL database.

### Using Render Blueprint

1. Push this repository to GitHub.
2. In [Render](https://dashboard.render.com), go to **New** > **Blueprint**.
3. Select this repo. Render will read `render.yaml` and set up:
   - A Node.js web service running `npm run build` and `npm start`.
   - A free PostgreSQL database linked via `DATABASE_URL`.
4. Click **Apply**.

### Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string. If omitted, uses local embedded PGlite. | `""` |
| `JWT_SECRET` | Secret key for signing auth tokens | `"spaceborn-secret-key"` |
| `JWT_EXPIRE` | Auth token duration | `"24h"` |

## Project Structure

```text
Spaceborn-Management-System/
├── backend/
│   ├── server.js          # Express app entrypoint
│   ├── seed.js            # Default seed data
│   └── src/
│       ├── app.js         # API routes + static frontend handler
│       ├── config/db.js   # PGlite / PostgreSQL connection
│       ├── controllers/   # Route handlers
│       ├── models/        # PostgreSQL data models
│       └── routes/        # Express API endpoints
├── frontend/
│   ├── src/               # React components and pages
│   └── public/            # Static assets
├── package.json           # Root build and run scripts
└── render.yaml            # Render deployment config
```


