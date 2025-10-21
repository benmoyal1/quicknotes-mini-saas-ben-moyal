# QuickNotes - Mini SaaS Application

A full-stack note-taking application with user authentication, tag-based search, Redis caching, and scalable architecture with load balancing.

## Features

- **User Management**: Registration and login with JWT authentication
- **Notes CRUD**: Create, read, update, and delete notes
- **Tag-Based Search**: Filter notes by tags with Redis caching
- **Scalable Architecture**: 2 API instances behind NGINX load balancer
- **Health Monitoring**: Health check endpoints
- **Metrics**: Prometheus-compatible metrics endpoint
- **Containerized**: Fully dockerized application

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- NestJS framework with TypeScript
- PostgreSQL for data persistence
- Redis for caching
- JWT for authentication
- TypeORM for database operations
- Prometheus metrics with prom-client

### DevOps
- Docker & Docker Compose
- NGINX load balancer
- Multi-stage builds for optimization
- Health checks for all services

## Architecture

```
                    ┌─────────────┐
                    │   Frontend  │
                    │  (React)    │
                    │  Port: 3000 │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   NGINX     │
                    │Load Balancer│
                    │  Port: 8080 │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────┐              ┌──────────┐
       │  API-1   │              │  API-2   │
       │ (NestJS) │              │ (NestJS) │
       │Port: 8080│              │Port: 8080│
       └────┬─────┘              └────┬─────┘
            │                         │
            └────────────┬────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │  │ Metrics  │
    │Port: 5432│  │Port: 6379│  │/metrics  │
    └──────────┘  └──────────┘  └──────────┘
```

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Make (optional, for using Makefile commands)

### Setup and Run

1. **Clone the repository**
```bash
cd assigment
```

2. **Start the application (Production)**
```bash
# Using Make
make build
make up

# Or using Docker Compose directly
docker-compose build
docker-compose up -d
```

3. **Start the application (Development with hot reload)**
```bash
# Using Make
make dev

# Or using Docker Compose directly
docker-compose -f docker-compose.dev.yml up
```

4. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8080/api
- Health Check: http://localhost:8080/health
- Metrics: http://localhost:8080/metrics

### Environment Variables

Copy `.env.example` files and customize as needed:

```bash
cp backend/.env.example backend/.env
```

Key variables:
- `DATABASE_HOST`: PostgreSQL host (default: postgres)
- `DATABASE_PORT`: PostgreSQL port (default: 5432)
- `DATABASE_NAME`: Database name (default: quicknotes)
- `REDIS_HOST`: Redis host (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `JWT_SECRET`: Secret key for JWT tokens (**change in production**)
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2025-10-21T12:00:00.000Z",
    "updatedAt": "2025-10-21T12:00:00.000Z"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: (same as register)
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {access_token}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2025-10-21T12:00:00.000Z",
    "updatedAt": "2025-10-21T12:00:00.000Z"
  }
}
```

### Notes Endpoints (All require authentication)

#### Get All Notes
```http
GET /api/notes
Authorization: Bearer {access_token}

# With tag filtering
GET /api/notes?tags=work,important
Authorization: Bearer {access_token}

Response:
[
  {
    "id": "uuid",
    "title": "My Note",
    "content": "Note content here",
    "tags": ["work", "important"],
    "userId": "uuid",
    "createdAt": "2025-10-21T12:00:00.000Z",
    "updatedAt": "2025-10-21T12:00:00.000Z"
  }
]
```

#### Get Single Note
```http
GET /api/notes/:id
Authorization: Bearer {access_token}

Response: (single note object)
```

#### Create Note
```http
POST /api/notes
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here",
  "tags": ["work", "important"]
}

Response: (created note object)
```

#### Update Note
```http
PATCH /api/notes/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated"]
}

Response: (updated note object)
```

#### Delete Note
```http
DELETE /api/notes/:id
Authorization: Bearer {access_token}

Response:
{
  "message": "Note deleted successfully"
}
```

### Monitoring Endpoints

#### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

#### Prometheus Metrics
```http
GET /metrics

Response: (Prometheus-formatted metrics)
```

## Makefile Commands

```bash
make help           # Show all available commands
make build          # Build all Docker images
make up             # Start all services (production)
make down           # Stop all services
make logs           # View logs from all services
make clean          # Remove containers, volumes, images

# Development
make dev            # Start in development mode with hot reload
make dev-build      # Build development images
make dev-up         # Start development in background
make dev-down       # Stop development services
make dev-logs       # View development logs

# Utilities
make restart        # Restart all services
make status         # Show service status
make backend-shell  # Open shell in API container
make db-shell       # Open PostgreSQL shell
make redis-cli      # Open Redis CLI
make health         # Check service health
make metrics        # View Prometheus metrics
```

## Project Structure

```
assigment/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management
│   │   ├── notes/           # Notes CRUD
│   │   ├── health/          # Health checks
│   │   ├── metrics/         # Prometheus metrics
│   │   ├── redis/           # Redis module
│   │   ├── app.module.ts    # Root module
│   │   └── main.ts          # Entry point
│   ├── Dockerfile           # Production dockerfile
│   ├── Dockerfile.dev       # Development dockerfile
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # Context providers
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── Dockerfile           # Production dockerfile
│   ├── Dockerfile.dev       # Development dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf           # NGINX configuration
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development compose
├── Makefile                 # Build automation
└── README.md
```

## Design Decisions & Tradeoffs

### 1. Load Balancing Strategy
- **Choice**: NGINX with round-robin
- **Tradeoff**: Simple but effective. HAProxy would offer more features but adds complexity.
- **Reasoning**: NGINX is lightweight, well-documented, and sufficient for this use case.

### 2. Caching Strategy
- **Choice**: Redis caching with full result sets
- **Cache Key Pattern**: `notes:user:{userId}:tags:{tags}`
- **TTL**: 5 minutes
- **Invalidation**: Clear all user caches on create/update/delete
- **Tradeoff**: Simple invalidation but may clear more than necessary. More granular caching would be complex.

### 3. Database Schema
- **Choice**: PostgreSQL native arrays for tags
- **Tradeoff**: Simpler schema (no junction table) but less flexible for complex tag queries.
- **Reasoning**: Sufficient for tag filtering, reduces complexity.

### 4. Authentication
- **Choice**: JWT stored in localStorage
- **Tradeoff**: Vulnerable to XSS but simpler than httpOnly cookies. Suitable for demo.
- **Reasoning**: Simpler implementation, works with CORS, stateless.

### 5. TypeORM Synchronize
- **Setting**: `synchronize: true` in development
- **WARNING**: Should be `false` in production, use migrations instead
- **Reasoning**: Faster development, but risky for production data.

### 6. API Scaling
- **Choice**: 2 instances behind NGINX
- **Reasoning**: Demonstrates horizontal scaling without over-engineering.
- **Future**: Could add auto-scaling based on metrics.

### 7. Session Storage
- **Choice**: Stateless JWT (no Redis session storage)
- **Tradeoff**: Can't invalidate tokens before expiry. Redis sessions would allow logout.
- **Reasoning**: True stateless architecture, simpler for load balancing.

## Monitoring & Observability

### Health Checks
All services have health checks configured in docker-compose:
- Database: PostgreSQL `pg_isready`
- Redis: `redis-cli ping`
- API: HTTP check on `/health`
- NGINX: HTTP check forwarded to API

### Metrics
Prometheus-compatible metrics exposed at `/metrics`:
- `http_request_duration_seconds`: Request duration histogram
- `http_requests_total`: Total request counter
- Default Node.js metrics (CPU, memory, GC, etc.)

### Load Balancer Health Checks
NGINX performs passive health checks:
- `max_fails=3`: Mark backend down after 3 failures
- `fail_timeout=30s`: Wait 30s before retrying failed backend

## Testing

### Manual Testing
```bash
# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create a note (replace TOKEN)
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test Note","content":"Content here","tags":["work"]}'

# Get notes with tag filter
curl http://localhost:8080/api/notes?tags=work \
  -H "Authorization: Bearer TOKEN"

# Check health
curl http://localhost:8080/health

# View metrics
curl http://localhost:8080/metrics
```

### Verify Load Balancing
Check NGINX logs to see requests distributed across api-1 and api-2:
```bash
docker-compose logs nginx
```

## Troubleshooting

### Services not starting
```bash
# Check service status
make status

# View logs
make logs

# Rebuild images
make clean
make build
make up
```

### Database connection issues
```bash
# Check PostgreSQL logs
docker logs quicknotes-postgres

# Connect to database
make db-shell
```

### Redis connection issues
```bash
# Check Redis logs
docker logs quicknotes-redis

# Connect to Redis
make redis-cli
```

### API errors
```bash
# Check API logs
docker logs quicknotes-api-1
docker logs quicknotes-api-2

# Open shell in API container
make backend-shell
```

## Development Workflow

### Running Locally (without Docker)

1. **Start PostgreSQL and Redis**
```bash
docker-compose up postgres redis -d
```

2. **Backend**
```bash
cd backend
npm install
npm run start:dev
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Hot Reload in Docker
Use development compose file for hot reload:
```bash
make dev
```

## Production Considerations

### Security
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use environment-specific secrets (not in docker-compose)
- [ ] Enable HTTPS with SSL certificates
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Use httpOnly cookies instead of localStorage for JWT

### Database
- [ ] Disable `synchronize: true` in TypeORM
- [ ] Create and run migrations
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Add database indexes for performance

### Monitoring
- [ ] Set up Prometheus scraping
- [ ] Add Grafana dashboards
- [ ] Configure alerting
- [ ] Add application logging (Winston/Pino)
- [ ] Implement distributed tracing

### Scaling
- [ ] Use managed PostgreSQL (RDS, Cloud SQL, etc.)
- [ ] Use managed Redis (ElastiCache, Redis Cloud, etc.)
- [ ] Configure auto-scaling for API instances
- [ ] Add CDN for frontend assets
- [ ] Implement API rate limiting

## License

ISC

## Author

Built as a technical assessment for demonstrating full-stack development, DevOps, and scalable architecture skills.
