.PHONY: help install dev build test clean docker-dev docker-prod docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	pnpm install

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yaml up --build

build: ## Build all projects
	pnpm build

test: ## Run tests
	pnpm test

clean: ## Clean all build artifacts
	pnpm clean
	docker-compose down -v
	docker system prune -f

docker-dev: ## Start development with Docker
	docker-compose -f docker-compose.dev.yaml up --build

docker-prod: ## Start production with Docker
	docker-compose -f docker-compose.prod.yml up --build -d

docker-down: ## Stop all Docker containers
	docker-compose -f docker-compose.dev.yaml down
	docker-compose -f docker-compose.prod.yml down

logs: ## Show Docker logs
	docker-compose -f docker-compose.dev.yaml logs -f

db-migrate: ## Run database migrations
	cd api && pnpm prisma migrate dev

db-seed: ## Seed database
	cd api && pnpm prisma db seed

db-reset: ## Reset database
	cd api && pnpm prisma migrate reset --force
