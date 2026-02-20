# On-Brella-403-Project

Your on-the-go umbrella service!

Link to living document: https://docs.google.com/document/d/1LU65YB4aleQ35Zhabvx-X3Wg0-YQ28uRWCdxK4oSLe8/edit?usp=sharing

## Description

"On-the-go" Umbrella, or On-Brella, is a mobile self-service web application that allows users to rent and use umbrellas by using an app to locate umbrella stations in the local Seattle area. The app allows them to find a nearby location housing rentable umbrellas, and once nearby, can reserve an umbrella for an allocated amount of time. Once done, users return the umbrella to their closest available umbrella station, and check their umbrella into the station.

### Key features:
* Users are able to generate an account to rent out umbrellas at stations.
* A map will display to users where nearby umbrella stations are.
* Users are able to view their rental history, including fee and rental duration.
* Stations are tracking the number of umbrellas remaining and the status umbrellas via code or sensor.

## Toolset

|   Frontend  | Backend |  Database  | Version Control | Deployment |
|-------------|---------|------------|-----------------|------------|
| React.js    | Node.js | PostgreSQL | Git + Github    | Vercel     |
| HTML        | Express |            |                 | Render     |
| CSS         |         |            |                 | Supabase   |
| JavaScript  |         |            |                 |            |

## Project Structure

```
.
├── backend/                    # Backend API server (Node.js/Express)
│   ├── src/
│   │   ├── config/            # Configuration (env vars, port, URLs)
│   │   ├── db/                # Database layer (Supabase/Postgres)
│   │   ├── middleware/        # Express middleware (error handling, validation)
│   │   ├── routes/            # API route handlers (stations, rent, return)
│   │   ├── services/          # Business logic (rentalService, hardwareClient)
│   │   ├── store/             # Rental store (DB persistence layer)
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Entry point
│   ├── tests/                 # Backend test suite (Jest)
│   ├── package.json
│   ├── jest.config.js
│   └── .env                   # Environment variables (DATABASE_URL, PORT, HARDWARE_URL)
│
├── frontend/                   # Frontend React application
│   ├── src/
│   │   ├── components/        # React components (MainLayout, QrScanner, StationMap)
│   │   ├── pages/             # Page components (ActivePage, MapPage, ScanPage2, HistoryPage)
│   │   ├── api/               # API client for backend communication
│   │   ├── config/            # Frontend configuration
│   │   ├── context/           # React context providers
│   │   ├── utils/             # Utility functions (cost, duration, stationNames)
│   │   └── App.jsx            # Main app component
│   ├── tests/                 # Frontend test suite
│   ├── package.json
│   ├── vite.config.js         # Vite build configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── postcss.config.js      # PostCSS configuration
│
├── hardwareSimulation/         # Hardware mock server (Mockoon)
│   ├── hardware-mock.json     # Mockoon configuration file
│   ├── tests/                 # Hardware mock tests
│   ├── test-mock.sh           # Shell script to test mock endpoints
│   ├── package.json
│   └── jest.config.js
│
├── docs/                       # Project documentation
│   └── architecture.md         # Architecture documentation
│
├── Status Report/              # Status reports (duplicate folder)
├── Status_Report/              # Status reports
│
├── Makefile                    # Convenience targets (install, build, test, run, clean)
├── package.json                # Root package.json with convenience scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Using the Makefile

From the project root you can use `make` for common tasks. Run **`make help`** to list all targets.

| Target | Description |
|--------|-------------|
| `make install` | Install dependencies for backend, frontend, and hardware simulation |
| `make build` | Build frontend for production (output in `frontend/dist`) |
| `make test` | Run backend tests |
| `make clean` | Remove all `node_modules` and `frontend/dist` |
| `make setup-env` | Copy `backend/.env.example` to `backend/.env` if it doesn't exist |
| `make run-hardware` | Start hardware mock on port 3000 |
| `make run-backend` | Start backend API on port 5001 |
| `make run-frontend` | Start frontend dev server (e.g. port 5173) |

**Quick start with Make:**

```bash
make install          # Install everything
make setup-env        # Create backend/.env from .env.example (then edit with your DATABASE_URL)
make run-hardware    # Terminal 1: hardware mock
make run-backend     # Terminal 2: backend
make run-frontend    # Terminal 3: frontend
```

---

## Prerequisites

Before building and running the system, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- **make** 
- **PostgreSQL** (via Supabase - see Database Setup below)
- **Git** (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Qhoang5804/On-Brella-403-Project
cd On-Brella-403-Project
```

### 2. Database Setup (Supabase)

The backend requires a PostgreSQL database connection. We use Supabase for this:

1. Create a project at [supabase.com](https://supabase.com)
2. In **Project Settings -- Database**, copy the **Connection string (URI)**
   - Use **Transaction** mode
   - Replace `[YOUR-PASSWORD]` with your database password
3. Ensure your Supabase project has the required tables:
   - `stations` - Umbrella station information
   - `umbrellas` - Umbrella inventory
   - `user` - User accounts
   - `rentals` - Rental transaction records

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `backend/.env` and set the following variables:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
PORT=5001
HARDWARE_URL=http://localhost:3000
```

**Note:** The `DATABASE_URL` is required for the backend to function properly.

## Build Instructions

You can use **`make install`** and **`make build`** from the project root instead of the commands below.

### Build All Components

The project consists of three main components. Build them in this order:

#### Step 1: Install Hardware Simulation Dependencies

```bash
cd hardwareSimulation
npm install
```

#### Step 2: Install Backend Dependencies

```bash
cd ../backend
npm install
```

#### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### Step 4: Build Frontend (Production)

```bash
cd frontend
npm run build
```

This creates a `dist/` directory with optimized production files.

**Alternative: Build from Root**

You can also install dependencies from the root directory:

```bash
# From project root
npm install --prefix backend
npm install --prefix frontend
npm install --prefix hardwareSimulation
```

## Test Instructions

You can use **`make test`** from the project root.

### Run All Tests

From the project root:

```bash
npm test
```

This runs the backend test suite.

### Run Tests by Component

#### Backend Tests

```bash
cd backend
npm test
```

Or from root:

```bash
npm run test:backend
```

**Test Coverage:**
- `config.jest.test.js` - Configuration environment variables
- `rentalService.jest.test.js` - Business logic (mocked hardware, mocked store)
- `hardwareClient.jest.test.js` - Hardware API client (mocked fetch)
- `middleware.jest.test.js` - Validation and error handling
- `api.jest.test.js` - Full API integration tests (mocked hardware and store)

#### Hardware Simulation Tests

**Important:** The hardware mock must be running before tests.

```bash
# Terminal 1: Start the hardware mock
cd hardwareSimulation
npm start

# Terminal 2: Run tests
cd hardwareSimulation
npm test
```

Or from root:

```bash
npm run test:hardware
```

#### Frontend Tests

```bash
cd frontend
npm test
```

**Note:** Frontend tests are currently minimal (placeholder).

### Running the Complete System

The system requires three services to run simultaneously:

1. **Hardware Simulation** (Mockoon) - Port 3000
2. **Backend API** (Express) - Port 5001
3. **Frontend** (Vite dev server) - Port 5173 (default)

### Step-by-Step: Running All Services

#### Terminal 1: Start Hardware Simulation

```bash
cd hardwareSimulation
npm start
```

The hardware mock will start on `http://localhost:3000`. Keep this terminal open.

**Verify it's running:**
```bash
curl http://localhost:3000/hardware/stations
```

#### Terminal 2: Start Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:5001` (or the port specified in `PORT` env var).

**Verify it's running:**
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

#### Terminal 3: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port).

Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

### Running from Root Directory

You can also use the root-level scripts:

```bash
# Start backend (from root)
npm start
```

**Note:** The root `npm start` only starts the backend. You still need to start the hardware simulation and frontend separately.

### Production Build and Preview

To preview the production build:

```bash
cd frontend
npm run build
npm run preview
```

This serves the optimized production build locally.

## API Endpoints

### Backend API (Port 5001)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api/stations` | List all umbrella stations |
| POST | `/api/rent` | Start a rental. Body: `{ stationId, slotNumber }` |
| POST | `/api/return` | End a rental. Body: `{ rentalId, stationId, slotNumber, umbrellaId }` |

**Session Management:** Use `X-Session-Id` header or include `sessionId` in the request body. Defaults to `guest` if not provided.

### Hardware Mock API (Port 3000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/hardware/stations` | List all stations with availability |
| POST | `/hardware/unlock` | Unlock an umbrella (start rental) |
| POST | `/hardware/return` | Return an umbrella (end rental) |

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Backend server port |
| `HARDWARE_URL` | `http://localhost:3000` | Hardware mock server URL |
| `DATABASE_URL` | — | **Required** - Supabase/Postgres connection URI |

### Frontend

The frontend uses Vite environment variables. Create `frontend/.env` if needed:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (defaults to `http://localhost:5001` in dev) |

## Authors

* Quan Hoang
* Kyle Sherman
* Angelo Villacrez
* Abel Mitiku
* Biniyam Gebreyohannes
* Daniel Alemayehu
