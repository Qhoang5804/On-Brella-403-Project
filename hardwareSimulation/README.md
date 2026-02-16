# Hardware simulation

This folder is a **mock** for umbrella stations. Config: `hardware-mock.json`. The backend talks to it instead of real hardware when you are developing or testing.

**Start the mock**

**Option A — Mockoon desktop app (recommended if you have it)**  
1. Open the Mockoon app on your laptop.  
2. Import or open `hardware-mock.json` from this folder.  
3. Start the server (port 3000).  
4. Leave it running. The mock is at http://localhost:3000.

**Option B — CLI from terminal**  
```bash
npm start
```
If you see **"environment's data are too recent"**, run `npm install` in this folder, then try again.

The mock must be running for the tests below to pass.

**Important: same machine**  
`localhost:3000` is the **machine where the terminal runs**. If your terminal is on a **remote host** (e.g. attu6, SSH) and the Mockoon app is on your **laptop**, requests from the terminal go to the remote host’s localhost, not your laptop. So Mockoon never sees them and you get no logs.  
**Fix:** Run the mock on the **same machine** as the terminal: use `npm start` in this folder on that machine (Option B). Then run `./test-mock.sh` or `npm test` there. If you must run Mockoon on your laptop and tests elsewhere, start the mock on the laptop, then run tests with `HARDWARE_URL=http://YOUR_LAPTOP_IP:3000 ./test-mock.sh` (and ensure Mockoon listens on all interfaces / your firewall allows port 3000).

**Check endpoints**

With the mock running, in another terminal run `./test-mock.sh` to hit all three endpoints and report OK/FAIL. Or run `npm test` for the Jest tests.

**Run tests**

In another terminal, from this folder:

```bash
npm test
```

Tests call the mock (GET stations, POST unlock, etc.). They use Jest. Start the mock first or the tests will fail.

**Main endpoints**

- `GET /hardware/stations` — list all stations
- `POST /hardware/unlock` — unlock an umbrella (body: `stationId`, `slotNumber`)
- `POST /hardware/return` — return an umbrella (body: `stationId`, `slotNumber`, `umbrellaId`)

Your backend should call these when a user rents or returns an umbrella.
