# On-Brella Backend

REST API for umbrella rental. Modular, extensible structure.

## Structure

```
src/
├── config/           # Env config (PORT, HARDWARE_URL, DATABASE_URL)
├── db/               # Database layer (Supabase/Postgres)
├── middleware/       # Error handling, validation
├── routes/           # API route handlers (stations, rent, return)
├── services/         # Business logic (rentalService, hardwareClient)
├── store/            # Rental store (DB via rentalStoreDb)
├── app.js            # Express app
└── server.js         # Entry point
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/stations | List stations (proxies to hardware) |
| GET | /api/history | List completed rental history. Query: `?limit=&offset=`. Session: `X-Session-Id`. |
| POST | /api/rent | Start rental. Body: `{ stationId, slotNumber }` |
| POST | /api/return | End rental. Body: `{ rentalId, stationId, slotNumber, umbrellaId }` |

**Session:** `X-Session-Id` header or `sessionId` in body. Defaults to `guest`.

## Run

```bash
# From project root
npm install
npm start
```

Server runs on port **5001** by default (or `PORT` env var). Port 5000 is avoided by default because macOS often uses it for AirPlay Receiver. Start the hardware mock (Mockoon) on port 3000 first: `cd hardwareSimulation && npm start` or run your Mockoon env on 3000.

## Database (Supabase)

The backend connects to **Supabase (Postgres)** when `DATABASE_URL` is set. The database layer is used only by the business layer, never by the frontend.

**Setup**

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database**, copy the **Connection string (URI)**. Use **Transaction** mode and replace `[YOUR-PASSWORD]` with your database password.
3. In the backend folder, copy `.env.example` to `.env` and set:
   ```env
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Ensure your Supabase project has the expected tables (`stations`, `umbrellas`, `user`, `rentals`). The file `src/db/schema.sql` is reference only (tables are already in Supabase).

**Health check:** `GET /health` returns `{ status: "ok", database: "connected" }` when the DB is reachable.

**POST /api/rent** and **POST /api/return** persist to the `rentals` table. `DATABASE_URL` is required to run the backend.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5001 | Server port |
| HARDWARE_URL | http://localhost:3000 | Hardware mock URL |
| DATABASE_URL | — | Supabase/Postgres connection URI (required) |

## Testing with Hoppscotch

Use base URL `http://localhost:5001`. Ensure Mockoon (hardware mock) is running on port 3000.

| Request | Method | URL | Body (if POST) |
|--------|--------|-----|----------------|
| Health | GET | `http://localhost:5001/health` | — |
| List stations | GET | `http://localhost:5001/api/stations` | — |
| Start rental | POST | `http://localhost:5001/api/rent` | `{"stationId":"station-001","slotNumber":5}` |
| End rental | POST | `http://localhost:5001/api/return` | `{"rentalId":"<from rent>","stationId":"station-001","slotNumber":5,"umbrellaId":"<from rent>"}` |

Optional: set header `X-Session-Id: my-session` to keep rentals per session.

## Testing (Jest)

All backend tests use Jest. No hardware mock required (hardware client is mocked).

```bash
# Run all project tests
npm test

# Run backend tests only
npm run test:backend
```

### Test Files

| File | Coverage |
|------|----------|
| `config.jest.test.js` | Config env vars |
| `rentalService.jest.test.js` | Business logic (mocked hardware, mocked store) |
| `hardwareClient.jest.test.js` | Hardware API client (mocked fetch) |
| `middleware.jest.test.js` | Validation, error handler |
| `api.jest.test.js` | Full API integration (mocked hardware and store) |