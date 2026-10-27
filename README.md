# Spaceborn Management System 🚀

A modern, lightweight, unified full-stack company management platform designed for teams and small-to-medium organizations (up to 50+ members). Features daily work reporting, task management, team performance tracking date-wise, role-based dashboards, leave management, and company-wide resource tracking.

---

## ⚡ Architectural Highlights

- **Unified Single-Service Full Stack (Approach A):** A single Express Node.js service serves both the REST API (`/api/*`) and the compiled React production client (`/*`). Zero CORS headaches, instant routing, and runs effortlessly on Render's free tier.
- **Dual-Mode Zero-Setup Database:**
  - **Local Development:** Uses embedded **PGlite** (`@electric-sql/pglite`) in `backend/data/spaceborn_pgdata`. Zero external database installation or Docker container required.
  - **Cloud Production:** Automatically switches to **Managed PostgreSQL** via `DATABASE_URL` (e.g. Render PostgreSQL or Supabase) with automated SSL and connection pooling.
- **Auto-Initialization & Auto-Seeding:** On fresh launch, all 18 PostgreSQL tables and indexes are automatically verified/created, and default demo accounts are seeded if empty.
- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities tailored for **CEO**, **COO**, **Manager**, **Team Lead**, and **Member**.

---

## 👥 Default Demo Credentials

On first run, the database automatically populates these initial accounts:

| Role | Employee ID | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **CEO** | `CEO001` | `admin123` | Full company overview, strategic metrics, executive decisions |
| **COO** | `COO001` | `coo123` | Operations, project health, department performance |
| **Manager** | `MGR001` | `manager123` | Department management, team daily reports date-wise, leave approvals |
| **Team Lead**| `LD001` | `lead123` | Team task delegation, standup reviews, resource requests |
| **Member** | `EMP001` | `member123` | Daily standup/task submissions, personal leave & attendance |

---

## 💻 Local Development & Quick Start

### Prerequisites
- Node.js `v18.x` or higher (tested with Node `v22.x`)
- npm `v9.x` or higher

### Option 1: Run Unified Production Build Locally (Recommended)
This runs the full-stack service exactly as it will run in production on Render:

```bash
# 1. Install dependencies and compile frontend
npm run build

# 2. Start the unified full-stack server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser. Both frontend and backend run seamlessly on port 5000!

---

### Option 2: Live Hot-Reloading Development Mode
If actively developing frontend or backend code:

```bash
# In terminal 1 (Backend API with nodemon):
npm run dev:backend

# In terminal 2 (React development server with hot-reload):
npm run dev:frontend
```
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000` (automatically proxies API requests to port 5000)

---

## ☁️ 1-Click Deployment to Render (Approach A)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint specification.

### 1-Click Deploy via Render Blueprint
1. Push this repository to your **GitHub** account.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Select your `Spaceborn-Management-System` repository.
5. Render reads `render.yaml` and will automatically provision:
   - **PostgreSQL Database** (`spaceborn-db`, Free Plan)
   - **Node.js Web Service** (`spaceborn-cms`, Free Plan)
   - Automatically links `DATABASE_URL` and generates a secure `JWT_SECRET`.
6. Click **Apply**.
7. Once deployment finishes, visit your live URL (`https://<your-subdomain>.onrender.com`). You will be greeted with the Spaceborn login screen!

### Manual Web Service Setup (Alternative)
If you prefer configuring the Web Service manually on Render:
1. **Create PostgreSQL Database:**
   - In Render, click **New +** > **PostgreSQL**.
   - Note the Internal Database URL.
2. **Create Web Service:**
   - Click **New +** > **Web Service** and connect this repository.
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. **Add Environment Variables:**
   - `DATABASE_URL`: Your Render PostgreSQL Internal Database URL.
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Any random 32+ character string.
4. Click **Deploy Web Service**.

---

## 📁 Repository Structure

```text
Spaceborn-Management-System/
├── package.json              # Root orchestration scripts (build, start, dev)
├── render.yaml               # Infrastructure-as-Code Blueprint for Render
├── README.md                 # Complete system documentation
│
├── backend/                  # Express REST API & Database Layer
│   ├── server.js             # Server entry point & listener
│   ├── seed.js               # Database seeding utility
│   ├── data/                 # Embedded PGlite storage (git-ignored)
│   └── src/
│       ├── app.js            # Express routing & static frontend serving
│       ├── config/db.js      # Dual-mode PG connection (PGlite / Cloud PG)
│       ├── models/           # 18 PostgreSQL data models
│       ├── controllers/      # Business logic handlers
│       └── routes/           # REST endpoints
│
└── frontend/                 # React Single Page Application (SPA)
    ├── package.json          # React dependencies & scripts
    ├── public/               # Static assets & index.html template
    ├── build/                # Compiled production bundle (served by backend)
    └── src/
        ├── components/       # Role-based dashboard views & UI components
        └── services/         # Dynamic API client layer (/api)
```

---

## 🔒 Security & Best Practices
- Passwords hashed with `bcryptjs` (salt rounds: 10).
- Stateless JWT authentication with role authorization middleware.
- Prepared parameterized SQL queries preventing SQL injection.
- Zero credentials committed to version control.
