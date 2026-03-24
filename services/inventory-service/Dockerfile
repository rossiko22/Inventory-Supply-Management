# Start from Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-jammy as build

# Set working directory
WORKDIR /app

# Copy Maven files first for dependency caching
COPY pom.xml mvnw* ./
COPY .mvn .mvn

# Download dependencies only (caching layer)
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application
RUN ./mvnw clean package -DskipTests

# Runtime image
FROM eclipse-temurin:21-jre-jammy

# Set working directory
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/target/inventory-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8086

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]