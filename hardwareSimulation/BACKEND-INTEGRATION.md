# Backend Integration with Hardware Mock

## What is the Hardware Mock?

The hardware mock is a **simulated umbrella station** that runs on `http://localhost:3000`. It replaces the physical hardware during development and testing. Instead of having real umbrella stations with physical locks and sensors, you have a Mockoon server that responds to HTTP requests just like real hardware would.

### Sample JSON

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
      "availableSlots": 3
    },
    {
      "stationId": "station-002",
      "location": {
        "latitude": 47.6560,
        "longitude": -122.3040
      },
      "status": "operational",
      "capacity": 10,
      "numUmbrellas": 5,
      "availableSlots": 5
    },
    {
      "stationId": "station-003",
      "location": {
        "latitude": 47.6545,
        "longitude": -122.3020
      },
      "status": "operational",
      "capacity": 10,
      "numUmbrellas": 10,
      "availableSlots": 0
    }
  ],
  "totalStations": 3,
  "timestamp": ""
}

The above JSON shows the response from the `/hardware/stations` endpoint. It contains:
- **3 stations** with their locations (UW campus coordinates)
- Each station has:
  - `stationId`: Unique identifier
  - `location`: GPS coordinates (latitude/longitude)
  - `status`: "operational"
  - `capacity`: Total slots (10)
  - `numUmbrellas`: Current number of umbrellas
  - `availableSlots`: How many slots are free

This is what the backend would receive when it queries the hardware simulation to get a list of all stations.

## Architecture Flow

```
Frontend (React)
    ↓ HTTP Request
Backend (Node.js/Express) ← Business Logic Layer
    ↓ HTTP Request
Hardware Mock (Mockoon on localhost:3000) 
```

According to architecture document:
- **Business Logic Layer** is the only component that talks to hardware
- **Hardware Simulation** abstracts physical hardware

## Complete Request Flow Example

### User Rents an Umbrella:

```
1. Frontend (React)
   User clicks "Rent Umbrella" button
   ↓
   POST /api/rent { userId: "user-123", stationId: "station-001", slotNumber: 5 }

2. Backend Interface (Express Route)
   Receives request at POST /api/rent
   ↓
   Calls rentalService.rentUmbrella()

3. Business Logic Layer (rentalService)
   - Checks business rules (user has no active rental)
   - Queries database (umbrella available?)
   ↓
   Calls hardwareService.unlockUmbrella()

4. Hardware Service
   Makes HTTP request to mock
   ↓
   POST http://localhost:3000/hardware/unlock
   { stationId: "station-001", slotNumber: 5 }

5. Hardware Mock (Mockoon)
   Returns: { success: true, message: "Umbrella unlocked successfully", ... }
   ↓
   Back to Business Logic

6. Business Logic Layer
   - Verifies unlock
   - Updates database (creates rental, updates umbrella status)
   ↓
   Returns rental object

7. Backend Interface
   Sends response to frontend
   ↓
   { success: true, rental: {...} }

8. Frontend
   Updates UI to show active rental
```

## Environment Configuration

Create a `.env` file in your backend:

```env
# Hardware Simulation URL
HARDWARE_URL=http://localhost:3000

# Database connection
DATABASE_URL=your_database_url

# Server port
PORT=5000
```

## Testing the Integration

1. **Start the hardware mock:**
   ```bash
   cd On-brella
   ./start-mock.sh
   ```

2. **Test from your backend:**
   ```javascript
   // In your backend code or test file
   const hardwareService = require('./services/hardwareService');
   
   // Test getting stations
   hardwareService.getAllStations()
     .then(stations => console.log(stations))
     .catch(err => console.error(err));
   ```

3. **Or use curl from terminal:**
   ```bash
   curl http://localhost:3000/hardware/stations
   ```

## Key Points

1. **Separation of Concerns**: The backend's business logic layer is the ONLY component that talks to the hardware mock. Frontend never directly calls hardware.

2. **Error Handling**: The hardware mock can return errors (400 status codes), so your backend must handle these gracefully.

3. **State Management**: The hardware mock simulates hardware behavior, but your database is the source of truth for business state (rentals, users, etc.).

4. **Development vs Production**: In development, use `http://localhost:3000`. In production, you'd replace this with the actual hardware API endpoint.

5. **Testing**: The mock allows you to test your backend without real hardware. You can simulate failures, delays, and different scenarios.

## Next Steps

1. Create the `hardwareService.js` module in your backend
2. Integrate it into your business logic layer
3. Update your API routes to use the business logic
4. Test the full flow: Frontend → Backend → Hardware Mock

The hardware mock is now ready to use! Just start it with `./start-mock.sh` and your backend can start making requests to it.
