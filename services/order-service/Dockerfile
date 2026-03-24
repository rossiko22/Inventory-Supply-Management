# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy solution and both csproj files for restore caching
COPY *.sln .
COPY *.csproj ./
COPY order-service.Tests/order-service.Tests.csproj ./order-service.Tests/

RUN dotnet restore

# Copy everything and publish only the main project
COPY . .
RUN dotnet publish order-service.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8087

ENTRYPOINT ["dotnet", "order-service.dll"]