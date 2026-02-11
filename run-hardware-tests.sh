#!/bin/bash
cd "$(dirname "$0")/hardwareSimulation" || exit 1
npm start &
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/hardware/stations 2>/dev/null | grep -q 200 && break
  sleep 1
done
npm test
