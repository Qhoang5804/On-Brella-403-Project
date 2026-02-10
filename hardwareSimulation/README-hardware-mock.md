# Hardware Simulation Mock Setup

This directory contains the Mockoon configuration for simulating the hardware (umbrella station) behavior for the On-Brella system.

## Prerequisites

Install Mockoon CLI globally:
```bash
npm install -g @mockoon/cli
```

Or install Mockoon Desktop application from [https://mockoon.com](https://mockoon.com)

## Running the Mock Server

### Option 1: Using Mockoon CLI

```bash
# Install Mockoon CLI if not already installed
npm install -g @mockoon/cli

# Run the mock server
mockoon-cli start --data hardware-mock.json --port 3000
```

### Option 2: Using Mockoon Desktop Application

1. Open Mockoon Desktop application
2. Click "Import/Export" → "Import from file"
3. Select `hardware-mock.json`
4. Click the "Start" button
5. The server will run on `http://localhost:3000`

## Available Endpoints

### 1. Unlock Umbrella
**POST** `/hardware/unlock`

Unlocks an umbrella at a specific station slot.

**Request Body:**
```json
{
  "stationId": "station-001",
  "slotNumber": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Umbrella unlocked successfully",
  "stationId": "station-001",
  "slotNumber": 5,
  "timestamp": "2026-01-13T..."
}
```

**Failure Response (400):**
```json
{
  "success": false,
  "message": "Failed to unlock umbrella: slot is empty or already unlocked",
  "stationId": "station-001",
  "slotNumber": 5
}
```

### 2. Return Umbrella
**POST** `/hardware/return`

Returns an umbrella to a specific station slot.

**Request Body:**
```json
{
  "stationId": "station-001",
  "slotNumber": 3,
  "umbrellaId": "umbrella-123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Umbrella returned successfully",
  "stationId": "station-001",
  "slotNumber": 3,
  "umbrellaId": "umbrella-123",
  "timestamp": "2026-01-13T..."
}
```

**Failure Response (400):**
```json
{
  "success": false,
  "message": "Failed to return umbrella: slot is full or station is at capacity",
  "stationId": "station-001",
  "slotNumber": 3
}
```

### 3. Get Station Status
**GET** `/hardware/status/:stationId`

Gets the current status of a station including available slots.

**Example:** `GET /hardware/status/station-001`

**Success Response (200):**
```json
{
  "stationId": "station-001",
  "status": "operational",
  "capacity": 10,
  "availableSlots": [1, 2, 3, 4, 5, 6, 7, 8],
  "occupiedSlots": [9, 10],
  "numUmbrellas": 8,
  "lastUpdated": "2026-01-13T..."
}
```

### 4. Get All Stations
**GET** `/hardware/stations`

Gets a list of all stations and their status.

**Success Response (200):**
```json
{
  "stations": [
    {
      "stationId": "station-001",
      "location": {
        "latitude": 47.6553,
        "longitude": -122.3035
      },
      "status": "operational",
      "capacity": 10,
      "numUmbrellas": 7,
      "availableSlots": 7
    }
  ],
  "totalStations": 3,
  "timestamp": "2026-01-13T..."
}
```

### 5. Verify Unlock
**GET** `/hardware/verify/unlock/:stationId/:slotNumber`

Verifies if an umbrella was successfully unlocked.

**Example:** `GET /hardware/verify/unlock/station-001/5`

**Response (200):**
```json
{
  "verified": true,
  "stationId": "station-001",
  "slotNumber": 5,
  "status": "unlocked",
  "timestamp": "2026-01-13T..."
}
```

### 6. Verify Return
**GET** `/hardware/verify/return/:stationId/:slotNumber`

Verifies if an umbrella was successfully returned.

**Example:** `GET /hardware/verify/return/station-001/3`

**Response (200):**
```json
{
  "verified": true,
  "stationId": "station-001",
  "slotNumber": 3,
  "status": "occupied",
  "timestamp": "2026-01-13T..."
}
```

## Testing the Endpoints

You can test the endpoints using curl or any HTTP client:

```bash
# Test unlock endpoint
curl -X POST http://localhost:3000/hardware/unlock \
  -H "Content-Type: application/json" \
  -d '{"stationId": "station-001", "slotNumber": 5}'

# Test return endpoint
curl -X POST http://localhost:3000/hardware/return \
  -H "Content-Type: application/json" \
  -d '{"stationId": "station-001", "slotNumber": 3, "umbrellaId": "umbrella-123"}'

# Test station status
curl http://localhost:3000/hardware/status/station-001

# Test all stations
curl http://localhost:3000/hardware/stations
```

## Integration with Backend

Your backend should make HTTP requests to `http://localhost:3000` when it needs to interact with the hardware simulation. The backend's business logic layer should call these endpoints when:

- A user rents an umbrella → call `/hardware/unlock`
- A user returns an umbrella → call `/hardware/return`
- Checking station availability → call `/hardware/status/:stationId`
- Getting all stations for map display → call `/hardware/stations`

## Notes

- The mock server runs on port 3000 by default
- CORS is enabled for all origins
- Responses include simulated latency (200-500ms) to mimic real hardware behavior
- Some endpoints have conditional responses based on request parameters (e.g., slotNumber = 0 triggers failure for unlock)
