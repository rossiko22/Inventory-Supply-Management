#!/bin/bash
set -euo pipefail

PROJECT_ROOT=~/Desktop/Moi-Proekti-Angular-SpringBoot/InventoryAndSupplyManagementProject/inventory-supply-system

echo "🛑 Stopping system..."

# Kill ports 8080–8090
for port in {8080..8090}; do
  pid=$(lsof -ti tcp:$port || true)
  if [ -n "$pid" ]; then
    echo "Killing port $port (PID $pid)"
    kill $pid || true
  fi
done

# Kill Angular (4200)
pid=$(lsof -ti tcp:4200 || true)
if [ -n "$pid" ]; then
  echo "Killing Angular on 4200 (PID $pid)"
  kill $pid || true
fi

# Extra cleanup (Java + .NET just in case)
echo "Cleaning leftover processes..."
pkill -f "spring-boot:run" || true
pkill -f "dotnet run" || true
pkill -f "ng serve" || true

# Stop Docker (WITHOUT removing volumes)
cd "$PROJECT_ROOT"
echo "🐳 Stopping Docker..."
docker compose down

echo "✅ System stopped"
