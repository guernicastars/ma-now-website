#!/bin/bash

# Start the server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Test endpoints
echo "Testing health endpoint:"
curl -s http://localhost:3000/health
echo ""

echo "Testing nearby consultants:"
curl -s "http://localhost:3000/api/consultants/nearby?lat=40.7128&lng=-74.0060"
echo ""

# Kill server
kill $SERVER_PID 2>/dev/null
