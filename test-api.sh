#!/bin/bash

echo "Starting API server test..."

# Start the API server in background
cd packages/api
npm run dev > /tmp/api-test.log 2>&1 &
API_PID=$!
cd ../..

echo "Waiting for server to start..."
sleep 8

echo ""
echo "=== Testing Health Endpoint ==="
curl -s http://localhost:3000/health | head -5
echo ""

echo ""
echo "=== Testing Auth - Register ==="
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}' | head -10
echo ""

echo ""
echo "=== Testing Auth - Login ==="
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"password123"}' | head -10
echo ""

echo ""
echo "=== Testing Nearby Consultants (NYC) ==="
curl -s "http://localhost:3000/api/consultants/nearby?lat=40.7128&lng=-74.0060&radius=10" | head -30
echo ""

echo ""
echo "=== Checking server log for location simulator ==="
tail -20 /tmp/api-test.log

# Kill the server
kill $API_PID 2>/dev/null
echo ""
echo "Test complete!"
