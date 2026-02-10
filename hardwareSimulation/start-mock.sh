#!/bin/bash

# On-Brella Hardware Mock Startup Script

echo "Starting On-Brella Hardware Simulation Mock..."
echo ""

# Check if mockoon-cli is installed
if ! command -v mockoon-cli &> /dev/null; then
    echo "Mockoon CLI not found. Installing..."
    npm install -g @mockoon/cli
    if [ $? -ne 0 ]; then
        echo "Failed to install Mockoon CLI. Please install manually: npm install -g @mockoon/cli"
        exit 1
    fi
    echo "Mockoon CLI installed successfully"
fi

echo " Starting mock server on http://localhost:3000"
echo ""
echo "Available endpoints:"
echo "  POST   /hardware/unlock"
echo "  POST   /hardware/return"
echo "  GET    /hardware/status/:stationId"
echo "  GET    /hardware/stations"
echo "  GET    /hardware/verify/unlock/:stationId/:slotNumber"
echo "  GET    /hardware/verify/return/:stationId/:slotNumber"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the mock server
mockoon-cli start --data hardware-mock.json --port 3000
