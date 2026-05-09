# Device Management Portal

A multi-module application for device management built with Spring Boot microservices, a React frontend, and a Python dashboard/chatbot helper.

## Architecture

- `EurekaServer/EurekaServer`: Spring Cloud Eureka discovery server.
- `deviceservice/deviceservice`: Device management backend service with MySQL persistence, Swagger UI, actuator, and WebSocket support.
- `api-and-auth/api-and-auth`: API gateway and authentication service.
- `frontend`: React SPA for the user interface.
- `pythonservice`: Flask-based Python helper service that reads CSV data, generates charts, and provides chatbot routes.

## Prerequisites

- Java 17
- Maven
- Node.js and npm
- Python 3.11+ with `pip`
- MySQL server

## Required Databases

Create two MySQL databases:

```sql
CREATE DATABASE device_details;
CREATE DATABASE userdb;
```

## Configuration

### MySQL settings

Update database credentials in these files if your MySQL user or password differs:

- `deviceservice/deviceservice/src/main/resources/application.properties`
- `api-and-auth/api-and-auth/src/main/resources/application.properties`

Default values in this project:

- `spring.datasource.url=jdbc:mysql://localhost:3306/device_details`
- `spring.datasource.username=root`
- `spring.datasource.password=Mysql@11`
- `spring.datasource.url=jdbc:mysql://localhost:3306/userdb`
- `spring.datasource.username=root`
- `spring.datasource.password=`

### Python service CSV data path

The Python helper service currently uses a hardcoded `BASE_DIR` path in `pythonservice/app.py`:

```python
BASE_DIR = r"<<BASE_DIR>>\capstone5\deviceservice\shared"
```

Update that value to point to this repository's shared CSV folder, for example:

```python
BASE_DIR = r"C:\Users\<your-user>\OneDrive\Desktop\DMP\device_management_portal\deviceservice\shared"
```

## Run order

Start services in this order:

1. MySQL server
2. Eureka server
3. Device service
4. API/Auth service
5. Frontend
6. Python service

## Start each module

### 1) Start Eureka Server

```powershell
cd EurekaServer\EurekaServer
.\mvnw.cmd spring-boot:run
```

This runs on `http://localhost:8761`.

### 2) Start Device Service

```powershell
cd ..\..\deviceservice\deviceservice
.\mvnw.cmd spring-boot:run
```

This service listens on `http://localhost:8082` and registers with Eureka.

### 3) Start API & Auth Service

```powershell
cd ..\..\api-and-auth\api-and-auth
.\mvnw.cmd spring-boot:run
```

This service listens on `http://localhost:8083`.

### 4) Start Frontend

```powershell
cd ..\..\frontend
npm install
npm start
```

The React app runs on `http://localhost:3000`.

### 5) Start Python Service

```powershell
cd ..\..\pythonservice
python -m pip install -r requirements.txt
python app.py
```

The Flask service runs on `http://localhost:5000`.

## Useful URLs

- Eureka dashboard: `http://localhost:8761`
- Device service Swagger (if exposed): `http://localhost:8082/swagger-ui.html` or `http://localhost:8082/swagger-ui/index.html`
- Frontend: `http://localhost:3000`
- Python service: `http://localhost:5000`

## Notes

- `deviceservice` uses `spring.jpa.hibernate.ddl-auto=update` to create/update tables automatically.
- `api-and-auth` also uses JPA and may require the `spring.datasource.password` value to be set.
- If you change ports or database settings, update the corresponding `application.properties` files.
- The frontend depends on backend services running on ports `8082`, `8083`, and optionally `5000` for Python features.

## Troubleshooting

- If services fail to start, verify Java 17 is installed and `JAVA_HOME` is set.
- If MySQL connection fails, confirm the database exists and the credentials match the `application.properties` entries.
- If the React app cannot reach backend services, confirm the backend ports are running and CORS is configured.
- For Python chart generation issues, ensure `kaleido` is installed and `BASE_DIR` points to the correct CSV folder.
