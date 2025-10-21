# QuickNotes Frontend - Quick Start Guide

Get up and running with the QuickNotes frontend in minutes!

## Prerequisites

- Node.js 18+ or Docker
- Backend API running on `http://localhost:8080`

## Option 1: Local Development (Recommended for Development)

### 1. Install Dependencies

```bash
npm install
# or
make install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (default: VITE_API_URL=http://localhost:8080/api)
```

### 3. Start Development Server

```bash
npm run dev
# or
make dev
```

The app will be available at **http://localhost:3000**

## Option 2: Docker (Recommended for Testing)

### Production Build

```bash
# Build and run
docker build -t quicknotes-frontend .
docker run -p 3000:3000 -e VITE_API_URL=http://localhost:8080/api quicknotes-frontend

# Or use Makefile
make docker-build
make docker-run
```

### Development Build (with hot reload)

```bash
# Build and run with hot reload
docker build -f Dockerfile.dev -t quicknotes-frontend:dev .
docker run -p 3000:3000 -v $(pwd)/src:/app/src quicknotes-frontend:dev

# Or use Makefile
make docker-build-dev
make docker-dev
```

## Option 3: Docker Compose

### Production

```bash
docker-compose up -d
# or
make up
```

### Development (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up -d
# or
make up-dev
```

## Verify Installation

1. Open http://localhost:3000
2. You should see the login page
3. Register a new account
4. Start creating notes!

## Health Check

```bash
curl http://localhost:3000/health
# Should return: healthy
```

## Common Commands

```bash
# Development
make dev              # Start dev server
make build            # Build production bundle
make preview          # Preview production build

# Docker
make docker-build     # Build production image
make docker-run       # Run production container
make docker-dev       # Run dev container with hot reload
make docker-stop      # Stop all containers

# Docker Compose
make up               # Start production
make up-dev           # Start development
make down             # Stop services
make logs             # View logs

# Cleanup
make clean            # Remove build artifacts
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Cannot Connect to API

1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check VITE_API_URL in .env matches your backend
3. Ensure CORS is enabled on backend

### Docker Issues

```bash
# Stop all containers
make docker-stop

# Clean Docker cache
docker system prune -a
```

## Next Steps

1. Start the backend API (see backend README)
2. Register a new user account
3. Create your first note
4. Try filtering by tags
5. Check the main README.md for detailed documentation

## Default Configuration

- **Frontend Port**: 3000
- **API URL**: http://localhost:8080/api
- **Hot Reload**: Enabled in dev mode
- **Health Check**: /health endpoint

## Support

- See [README.md](README.md) for detailed documentation
- Check backend is running before starting frontend
- Ensure environment variables are correctly set
