const BASE_URL = process.env.HARDWARE_URL || "http://localhost:3000";

async function test() {
  const res = await fetch(`${BASE_URL}/hardware/stations`);
  const data = await res.json();
  if (res.status !== 200 || !Array.isArray(data.stations)) {
    console.error("FAIL: GET /hardware/stations");
    process.exit(1);
  }
  console.log("PASS: GET /hardware/stations");
}

test().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
