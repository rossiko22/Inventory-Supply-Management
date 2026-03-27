#!/bin/bash
set -euo pipefail

PROJECT_ROOT=~/Desktop/Moi-Proekti-Angular-SpringBoot/InventoryAndSupplyManagementProject/inventory-supply-system

echo "🚀 Starting system..."

cd "$PROJECT_ROOT"

echo "🐳 Starting Docker..."
docker compose up -d

echo "⏳ Waiting for DB..."
sleep 10

mkdir -p "$PROJECT_ROOT/logs"

start_spring_service() {
  local service_path=$1
  local log_file=$2

  echo "Starting Spring: $service_path"
  cd "$service_path"
  mvn spring-boot:run > "$PROJECT_ROOT/logs/$log_file" 2>&1 &
}

start_dotnet_service() {
  local service_path=$1
  local log_file=$2

  echo "Starting .NET: $service_path"
  cd "$service_path"
  dotnet run > "$PROJECT_ROOT/logs/$log_file" 2>&1 &
}

# Gateway
start_spring_service "$PROJECT_ROOT/gateway-service" "gateway.log"

# Spring services
for service in auth-service company-service inventory-service order-service warehouse-service; do
  start_spring_service "$PROJECT_ROOT/services/$service" "$service.log"
done

# .NET services
for service in fleet-service order-service product-service; do
  start_dotnet_service "$PROJECT_ROOT/services/$service" "$service.log"
done

# Frontend
echo "🌐 Starting Angular..."
cd "${PROJECT_ROOT}/web-app/inventory-system-frontend"
ng serve > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &

echo "✅ System started"
