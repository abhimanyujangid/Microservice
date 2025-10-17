# Microservices Workspace

## Services

### 1. Auth Microservice (port 3000)
- HTTP + RabbitMQ microservice
- Handles user registration, login, JWT issuance
- Strategies: Local (email/password), JWT

**Endpoints:**
- `POST /auth/login` - Login with email/password (returns JWT)
- `GET /auth/profile` - Get current user (requires JWT)

**RabbitMQ Handlers:**
- `auth.login` - RPC login
- `auth.register` - RPC register new user

### 2. API Gateway (port 3001)
- HTTP gateway that proxies to microservices via RabbitMQ
- No DTOs or validation (handled by downstream services)

**Endpoints:**
- `POST /auth/login` - Proxies to auth.login
- `POST /auth/register` - Proxies to auth.register

### 3. Token Service (port 3002)
- Internal microservice for JWT verification
- Accessible only via RabbitMQ (no HTTP endpoints)

**RabbitMQ Handlers:**
- `token.verify` - Verify JWT token and return decoded payload

## Quick Start

### Option 1: Docker Compose (recommended)
Run all services + MongoDB + RabbitMQ:
```bash
docker-compose up --build
```

Access:
- API Gateway: http://localhost:3001
- Auth Service: http://localhost:3000
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### Option 2: Local Development
1. Start MongoDB and RabbitMQ:
```bash
docker run -d -p 27017:27017 mongo:6
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

2. Start each service:
```bash
# Terminal 1 - Auth Service
cd auth-microservice
npm i
npm run start:dev

# Terminal 2 - API Gateway
cd api-gateway
npm i
npm run start:dev

# Terminal 3 - Token Service
cd token-service
npm i
npm run start:dev
```

## Environment Variables

### Auth Service (.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/auth
JWT_SECRET=supersecret
JWT_EXPIRATION_TIME=3600
RABBITMQ_URL=amqp://localhost:5672
```

### API Gateway (.env)
```env
PORT=3001
RABBITMQ_URL=amqp://localhost:5672
```

### Token Service (.env)
```env
PORT=3002
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=supersecret
```

## Example Usage

### Register a new user (via API Gateway)
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Login (via API Gateway)
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get profile (direct to Auth Service with JWT)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/auth/profile
```

### Verify token (internal RPC - example from Node.js)
```javascript
// In another microservice that connects to RabbitMQ
const result = await client.send(
  { cmd: 'token.verify' },
  { token: 'YOUR_TOKEN_HERE' }
).toPromise();
// Returns: { valid: true, decoded: {...} } or { valid: false, error: '...' }
```

## Architecture

```
┌─────────────┐     HTTP      ┌──────────────┐
│   Client    │───────────────▶│ API Gateway  │
└─────────────┘                │  (port 3001) │
                               └───────┬──────┘
                                       │ RabbitMQ
                     ┌─────────────────┼─────────────────┐
                     │                 │                 │
                     ▼                 ▼                 ▼
             ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
             │ Auth Service  │ │Token Service │ │ More Services│
             │  (port 3000)  │ │ (port 3002)  │ │   (future)   │
             └───────┬───────┘ └──────────────┘ └──────────────┘
                     │
                     ▼
              ┌──────────┐
              │ MongoDB  │
              └──────────┘
```

## Notes
- Auth service uses Fastify + global exception filter
- API Gateway is a thin RPC proxy (no validation/DTOs)
- Token service is internal-only for JWT verification
- All services use RabbitMQ for inter-service communication
