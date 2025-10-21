.PHONY: help build up down logs clean dev dev-up dev-down test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services in production mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

clean: ## Remove all containers, volumes, and images
	docker-compose down -v
	docker system prune -f

dev: ## Start services in development mode with hot reload
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Build development Docker images
	docker-compose -f docker-compose.dev.yml build

dev-up: ## Start development services in background
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development services
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

restart: ## Restart all services
	docker-compose restart

status: ## Show status of all services
	docker-compose ps

backend-shell: ## Open shell in backend container
	docker exec -it quicknotes-api-1 sh

db-shell: ## Open PostgreSQL shell
	docker exec -it quicknotes-postgres psql -U postgres -d quicknotes

redis-cli: ## Open Redis CLI
	docker exec -it quicknotes-redis redis-cli

health: ## Check health of all services
	@echo "Checking service health..."
	@curl -s http://localhost:8080/health | jq . || echo "API health check failed"

metrics: ## View Prometheus metrics
	@curl -s http://localhost:8080/metrics

install-backend: ## Install backend dependencies locally
	cd backend && npm install

install-frontend: ## Install frontend dependencies locally
	cd frontend && npm install

install-all: install-backend install-frontend ## Install all dependencies locally
