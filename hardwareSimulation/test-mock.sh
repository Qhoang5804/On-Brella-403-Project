#!/bin/bash

# Test script for On-Brella Hardware Mock
# Make sure the mock server is running before executing this script

BASE_URL="http://localhost:3000"

echo "Testing On-Brella Hardware Mock Endpoints"
echo "=============================================="
echo ""

# Test 1: Get all stations
echo "1️  Testing GET /hardware/stations"
curl -s -X GET "$BASE_URL/hardware/stations" | jq '.' || echo "Failed or jq not installed"
echo ""
echo ""

# Test 2: Get station status
echo "2️ Testing GET /hardware/status/station-001"
curl -s -X GET "$BASE_URL/hardware/status/station-001" | jq '.' || echo " Failed or jq not installed"
echo ""
echo ""

# Test 3: Unlock umbrella
echo "3️. Testing POST /hardware/unlock"
curl -s -X POST "$BASE_URL/hardware/unlock" \
  -H "Content-Type: application/json" \
  -d '{"stationId": "station-001", "slotNumber": 5}' | jq '.' || echo "Failed or jq not installed"
echo ""
echo ""

# Test 4: Return umbrella
echo "4️.  Testing POST /hardware/return"
curl -s -X POST "$BASE_URL/hardware/return" \
  -H "Content-Type: application/json" \
  -d '{"stationId": "station-001", "slotNumber": 3, "umbrellaId": "umbrella-123"}' | jq '.' || echo "Failed or jq not installed"
echo ""
echo ""

# Test 5: Verify unlock
echo "5️.  Testing GET /hardware/verify/unlock/station-001/5"
curl -s -X GET "$BASE_URL/hardware/verify/unlock/station-001/5" | jq '.' || echo " Failed or jq not installed"
echo ""
echo ""

# Test 6: Verify return
echo "6️. Testing GET /hardware/verify/return/station-001/3"
curl -s -X GET "$BASE_URL/hardware/verify/return/station-001/3" | jq '.' || echo " Failed or jq not installed"
echo ""
echo ""

echo "Testing complete!"
echo ""
echo "Note: If you see 'jq not installed', install it with: brew install jq (macOS) or apt-get install jq (Linux)"
