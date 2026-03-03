# On-Brella-403-Project

Your on-the-go umbrella service!

Link to living document: https://docs.google.com/document/d/1LU65YB4aleQ35Zhabvx-X3Wg0-YQ28uRWCdxK4oSLe8/edit?usp=sharing

## Description

"On-the-go" Umbrella, or On-Brella, is a mobile self-service web application that allows users to rent and use umbrellas by using an app to locate umbrella stations in the local Seattle area. The app allows them to find a nearby location housing rentable umbrellas, and once nearby, can reserve an umbrella for an allocated amount of time. Once done, users return the umbrella to their closest available umbrella station, and check their umbrella into the station.

### Key features:
* Users are able to generate an account to rent out umbrellas at stations.
* A map will display to users where nearby umbrella stations are.
* Users are able to view their rental history, including fee and rental duration (see [Profile & history](docs/profile-and-history.md)).
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

1. Create a project at [supabase.com](https://supabase.com).
2. In your Supabase project, go to **Settings → Database**. Under **Connection info** (or **Connection string / URI**), copy the full **Postgres connection string (URI)**. This is the value you will paste into `DATABASE_URL`.  
   - If the URI contains a placeholder password, replace it with your actual database password.  
   - Use the standard Postgres connection string (not HTTP/REST) – it should start with `postgres://` or `postgresql://`.
3. Ensure your Supabase project has the required tables and columns described below.

#### Required tables and columns

- **`stations`** – umbrella station information and availability  
  | Column           | Type                | Notes                                      |
  |------------------|---------------------|--------------------------------------------|
  | `station_id`     | `text` (PK)         | Unique station identifier                  |
  | `latitude`       | `double precision`  | Station latitude                           |
  | `longitude`      | `double precision`  | Station longitude                          |
  | `capacity`       | `integer`           | Total umbrella capacity at the station     |
  | `num_brellas`    | `integer`           | Current number of umbrellas at the station |
  | `status`         | `text`              | e.g. `operational`                         |

- **`rentals`** – rental history and active rentals  
  | Column               | Type               | Notes                                             |
  |----------------------|--------------------|---------------------------------------------------|
  | `rental_id`          | `text` (PK)        | Unique rental ID                                  |
  | `session_id`         | `text`             | Session identifier (`X-Session-Id` or fallback)   |
  | `umbrella_id`        | `text`             | Logical umbrella identifier                       |
  | `station_id`         | `text`             | Origin station ID                                 |
  | `slot_number`        | `integer`          | Slot at origin station                            |
  | `start_time`         | `timestamp`        | Rental start time                                 |
  | `end_time`           | `timestamp`        | Rental end time (nullable until completed)       |
  | `return_station_id`  | `text`             | Station where umbrella was returned (nullable)    |
  | `return_slot_number` | `integer`          | Slot at return station (nullable)                 |
  | `status`             | `text`             | e.g. `ACTIVE`, `COMPLETED`                        |
  | `created_at`         | `timestamp`        | Optional created-at timestamp                     |

- **`umbrellas`** – umbrella inventory (basic schema, not heavily used by the backend)  
  | Column        | Type   | Notes                         |
  |---------------|--------|-------------------------------|
  | `umbrella_id` | `text` | Primary key / umbrella ID     |
  | `station_id`  | `text` | Current station (nullable)    |
  | `status`      | `text` | e.g. `available`, `missing`   |

- **`user`** – app users (optional for core rental flow, but useful for demos)  
  | Column          | Type   | Notes                       |
  |-----------------|--------|-----------------------------|
  | `user_id`       | `uuid` | Primary key                 |
  | `name`          | `text` | User display name           |
  | `email`         | `text` | User email                  |
  | `account_status`| `text` | e.g. `active`, `disabled`   |

You can create these tables using the Supabase Table editor UI, or by running equivalent `CREATE TABLE` statements in the SQL editor. Rentals do **not** need seed data; they are created automatically when you use the app. For a working demo, create at least a few `stations` rows (matching the example IDs used by the hardware mock such as `station-001`, `station-002`, etc.).

#### Example Supabase table views

These screenshots show what the demo tables look like in Supabase:

![Supabase rentals table](docs/images/supabase-rentals.png)

![Supabase stations table](docs/images/supabase-stations.png)

![Supabase user table](docs/images/supabase-user.png)

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `backend/.env` and set the following variables:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres
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

### Code Coverage

We use **Jest's built-in coverage** tooling for the backend and hardware simulation, and **Vitest coverage** for the frontend.

- **Run backend tests with coverage locally:**

  ```bash
  cd backend
  npm run test:coverage
  # Then open backend/coverage/lcov-report/index.html in a browser to inspect coverage
  ```

- **Run hardware simulation tests with coverage locally:**

  ```bash
  cd hardwareSimulation
  npm run test:coverage
  # Then open hardwareSimulation/coverage/lcov-report/index.html in a browser to inspect coverage
  ```

- **From the project root:**

  ```bash
  # Backend coverage
  npm run test:coverage

  # Hardware simulation coverage
  npm run test:hardware:coverage
  ```

- **Run frontend tests with coverage locally:**

  ```bash
  cd frontend
  npm run test:coverage
  # Then open frontend/coverage/lcov-report/index.html in a browser to inspect coverage
  ```

- **In CI (GitHub Actions):**
  - The `CI` workflow runs `npm run test:coverage` (backend) and `npm run test:hardware:coverage` (hardware simulation) on every push and pull request to `main`.
  - The generated coverage reports are uploaded as GitHub Actions artifacts:
    - `backend-coverage` → contents of `backend/coverage/`
    - `hardware-coverage` → contents of `hardwareSimulation/coverage/`

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

### How to Add New Tests

- **Test harness:** Frontend, Backend and hardware simulation use **Jest**.
- **Naming convention:** Name test files with the pattern `*.jest.test.js` (e.g. `myFeature.jest.test.js`). Jest is configured to match this pattern in `backend/jest.config.js` and `hardwareSimulation/jest.config.js`.
- **Where to add tests:**
  - Backend: add new test files in `backend/tests/`.
  - Hardware simulation: add new test files in `hardwareSimulation/tests/`.
  - Frontend: add tests in `frontend/tests/` (or as needed by your frontend test setup).
- **Running your new tests:** From the component directory run `npm test`, or from the project root use `npm run test:backend` or `npm run test:hardware`. For hardware tests, ensure the hardware mock is running first (see Hardware Simulation Tests above).

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

## Building a Release

Before creating a release:

1. **Update versions**  
   If the release includes a version bump, update the relevant version numbers (for example in `package.json` files and any referenced documentation) to reflect the new release.

2. **Build the software**  
   From the project root:
   ```bash
   make install
   make build
   ```
   This installs dependencies and builds the frontend for production (output in `frontend/dist/`).

3. **Run sanity checks**  
   - Run the test suite: `make test` (or `npm test` from root).  
   - Verify environment configuration: check `backend/.env` and `frontend/.env` (if used) for correct values for the target environment; never commit secrets.

4. **Manual steps**  
   - Tag the release in Git (for example `git tag vX.Y.Z`) and push tags.  
   - Deploy the backend, frontend, and any supporting services using your chosen deployment platforms (e.g. Vercel, Render, Supabase).  
   - In the target environment, start the required services (hardware simulation if applicable, backend, frontend) and perform a quick smoke test (e.g. health endpoint, basic user flows) to confirm the release is healthy.

## API Endpoints

### Backend API (Port 5001)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api/stations` | List all umbrella stations |
| GET | `/api/history` | List completed rental history for the session. Query: `?limit=&offset=`. Header: `X-Session-Id`. |
| POST | `/api/rent` | Start a rental. Body: `{ stationId, slotNumber }` |
| POST | `/api/return` | End a rental. Body: `{ rentalId, stationId, slotNumber, umbrellaId }` |

**Session Management:** Use `X-Session-Id` header or include `sessionId` in the request body. Defaults to `guest` if not provided. Rent, return, and history all use the same session so completed rentals appear on the History page when using the same browser tab.

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
| `VITE_API_URL` | Backend API base URL. Leave unset in dev to use the Vite proxy (`/api` → backend); set only when the frontend must call a different host (e.g. production API). See [Profile & history](docs/profile-and-history.md) for details. |

## Authors

* Quan Hoang
* Kyle Sherman
* Angelo Villacrez
* Abel Mitiku
* Biniyam Gebreyohannes
* Daniel Alemayehu

## Gamma Release Tag
 * gamma_release