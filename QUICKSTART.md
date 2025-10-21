# QuickStart Guide - QuickNotes

## Fastest Way to Get Started

### Option 1: Using Make (Recommended)

```bash
# Build and start all services
make build
make up

# View logs
make logs

# Stop services
make down
```

### Option 2: Using Docker Compose

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Development Mode with Hot Reload

```bash
# Using Make
make dev

# Or using Docker Compose
docker-compose -f docker-compose.dev.yml up
```

## Access the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:8080/metrics

## Quick Test

1. **Register a user** at http://localhost:3000
2. **Login** with your credentials
3. **Create notes** with tags
4. **Filter by tags** to see Redis caching in action

## Verify Services

```bash
# Check service status
make status

# Or
docker-compose ps

# Check health
make health

# Or
curl http://localhost:8080/health
```

## Architecture Overview

```
Frontend (Port 3000)
    ↓
NGINX Load Balancer (Port 8080)
    ↓
API-1 & API-2 (NestJS Backend)
    ↓
PostgreSQL (Port 5432) & Redis (Port 6379)
```

## Common Commands

```bash
make help              # Show all available commands
make logs              # View logs
make restart           # Restart all services
make clean             # Clean up everything
make backend-shell     # Open shell in API container
make db-shell          # Open PostgreSQL shell
make redis-cli         # Open Redis CLI
```

## Troubleshooting

### Services won't start
```bash
make clean
make build
make up
```

### View specific service logs
```bash
docker logs quicknotes-api-1
docker logs quicknotes-api-2
docker logs quicknotes-nginx
docker logs quicknotes-postgres
docker logs quicknotes-redis
docker logs quicknotes-frontend
```
 
### Reset database
```bash
make down
docker volume rm assigment_postgres_data
make up
```

## What's Included

✅ User authentication (JWT)
✅ Notes CRUD operations
✅ Tag-based search with Redis caching
✅ 2 API instances with NGINX load balancing
✅ Health checks
✅ Prometheus metrics
✅ Full Docker orchestration
✅ Development mode with hot reload

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Test the API endpoints (see API Documentation in README)
- Check the metrics at `/metrics`
- Explore the codebase structure

## Development Tips

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Running Tests Locally
```bash
# Start only database services
docker-compose up postgres redis -d

# Run backend locally
cd backend
npm run start:dev

# Run frontend locally
cd frontend
npm run dev
```

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `synchronize: false` in TypeORM config
- [ ] Create and run database migrations
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and alerting
- [ ] Configure database backups
- [ ] Review security settings

---

**Built with**: NestJS, React, TypeScript, PostgreSQL, Redis, Docker, NGINX
