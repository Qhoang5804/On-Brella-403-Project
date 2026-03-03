# Hardware Simulation

Mock for On-Brella umbrella stations. Simulates physical station behavior (list stations, unlock, return) for development and testing without real hardware.

**Base URL:** `http://localhost:3000`

---

## Quick Start

```bash
# 1. Install dependencies
cd hardwareSimulation && npm install

# 2. Start the mock (leave running)
npm start

# 3. In another terminal — verify endpoints
./test-mock.sh
# or
npm test
```

---

## Running the Mock

### Option A — CLI (recommended)

```bash
npm start
```

Starts Mockoon CLI on port 3000. Use this when developing on a remote server (e.g. attu) or in CI.

> If you see **"environment's data are too recent"**, run `npm install` and try again.

### Option B — Mockoon Desktop App

1. Open [Mockoon](https://mockoon.com/)
2. Import `hardware-mock.json` from this folder
3. Start the server on port 3000

Useful if you want to inspect requests in the Mockoon UI.

### Same-Machine Rule

`localhost:3000` is the machine where your terminal runs. If you're on a **remote host** (SSH) and Mockoon is on your **laptop**, the mock on your laptop will not receive requests.

- **Same machine:** Run `npm start` on the machine where you run tests.
- **Different machines:** Run the mock on your laptop, set `HARDWARE_URL=http://YOUR_LAPTOP_IP:3000`, and ensure Mockoon listens on all interfaces and your firewall allows port 3000.

---

## API Reference

### GET /hardware/stations

List all umbrella stations and their availability.

**Response (200):**

```json
{
  "stations": [
    {
      "stationId": "station-001",
      "location": { "latitude": 47.6553, "longitude": -122.3035 },
      "status": "operational",
      "capacity": 10,
      "numUmbrellas": 7,
      "availableSlots": 3
    }
  ],
  "totalStations": 2
}
```

---

### POST /hardware/unlock

Unlock an umbrella at a station (start rental).

**Request body:**

| Field       | Type   | Required |
|------------|--------|----------|
| stationId  | string | yes      |
| slotNumber | number | yes      |

**Example:** `{ "stationId": "station-001", "slotNumber": 5 }`

**Response (200):**

```json
{
  "success": true,
  "message": "Umbrella unlocked successfully",
  "stationId": "station-001",
  "slotNumber": 5
}
```

---

### POST /hardware/return

Return an umbrella to a station (end rental).

**Request body:**

| Field       | Type   | Required |
|------------|--------|----------|
| stationId  | string | yes      |
| slotNumber | number | yes      |
| umbrellaId | string | yes      |

**Example:** `{ "stationId": "station-001", "slotNumber": 3, "umbrellaId": "umbrella-123" }`

**Response (200):**

```json
{
  "success": true,
  "message": "Umbrella returned successfully",
  "stationId": "station-001",
  "slotNumber": 3,
  "umbrellaId": "umbrella-123"
}
```

---

## Testing

| Command          | Description                            |
|------------------|----------------------------------------|
| `npm test`       | Run Jest tests against the mock        |
| `./test-mock.sh` | Quick HTTP check (curl) of all 3 endpoints |

**Requirement:** The mock must be running (`npm start`) before tests.

**Override URL:** `HARDWARE_URL=http://host:3000 npm test` or `HARDWARE_URL=http://host:3000 ./test-mock.sh`

---

## Files

| File                 | Purpose                          |
|----------------------|----------------------------------|
| `hardware-mock.json` | Mockoon config (stations, routes)|
| `test-mock.sh`       | Shell script to verify endpoints |
| `tests/hardware.jest.test.js` | Jest integration tests    |

---

## Integration

The On-Brella backend calls these endpoints when users rent or return umbrellas. Point the backend at `http://localhost:3000` (or `HARDWARE_URL`) when the mock is running.

### Relationship to Supabase

- `hardware-mock.json` is **purely a mock** of the hardware API; it does **not** read from or write to Supabase.
- Supabase (Postgres) is the **system of record** for stations, rentals, and history.
- The **backend** is the glue:
  - It calls the hardware mock (`/hardware/stations`, `/hardware/unlock`, `/hardware/return`) to simulate physical behavior.
  - It then persists or updates the resulting state in Supabase tables (for example, creating/updating rows in `rentals` and `stations`).
- The hardware mock and Supabase **never sync directly with each other**; all coordination flows through the backend.
