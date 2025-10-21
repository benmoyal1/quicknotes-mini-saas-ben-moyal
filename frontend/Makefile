.PHONY: help install dev build preview docker-build docker-run docker-dev docker-stop clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build production bundle
	npm run build

preview: ## Preview production build
	npm run preview

lint: ## Run ESLint
	npm run lint

# Docker commands
docker-build: ## Build production Docker image
	docker build -t quicknotes-frontend:latest .

docker-build-dev: ## Build development Docker image
	docker build -f Dockerfile.dev -t quicknotes-frontend:dev .

docker-run: ## Run production Docker container
	docker run -d -p 3000:3000 --name quicknotes-frontend \
		-e VITE_API_URL=http://localhost:8080/api \
		quicknotes-frontend:latest

docker-dev: ## Run development Docker container with hot reload
	docker run -d -p 3000:3000 --name quicknotes-frontend-dev \
		-v $$(pwd)/src:/app/src \
		-e VITE_API_URL=http://localhost:8080/api \
		quicknotes-frontend:dev

docker-stop: ## Stop and remove Docker containers
	docker stop quicknotes-frontend quicknotes-frontend-dev 2>/dev/null || true
	docker rm quicknotes-frontend quicknotes-frontend-dev 2>/dev/null || true

# Docker Compose commands
up: ## Start with docker-compose (production)
	docker-compose up -d

up-dev: ## Start with docker-compose (development)
	docker-compose -f docker-compose.dev.yml up -d

down: ## Stop docker-compose services
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## View docker-compose logs
	docker-compose logs -f

clean: ## Clean build artifacts and dependencies
	rm -rf dist node_modules
	docker-compose down -v 2>/dev/null || true

setup: install ## Complete setup (install dependencies)
	@echo "Setup complete! Run 'make dev' to start development server"
