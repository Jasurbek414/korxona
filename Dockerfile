# ============= BACKEND =============
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app
COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN cd backend && chmod +x mvnw && ./mvnw package -DskipTests

# ============= FRONTEND =============
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# ============= BACKEND RUNTIME =============
FROM eclipse-temurin:21-jre-alpine AS backend
WORKDIR /app
RUN apk add --no-cache postgresql-client
COPY --from=backend-build /app/backend/target/*.jar app.jar
RUN mkdir -p /app/uploads /app/backups
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# ============= FRONTEND RUNTIME =============
FROM nginx:1.25-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80
