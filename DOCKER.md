# Docker & DevOps Setup

## 🐳 Docker Configuration

### Multi-stage Build
- **Base**: Node.js 22.14.0 + pnpm
- **Builder**: Install deps + build + Prisma generate
- **Development**: Hot reload with volumes
- **Production**: Minimal runtime image

### Services
- **PostgreSQL**: Database with health checks
- **API**: NestJS backend on port 3001
- **Web**: Next.js frontend on port 3000

## 🚀 Quick Start

### Development
```bash
# Start development environment
make docker-dev

# Or manually
docker-compose -f docker-compose.dev.yaml up --build
```

### Production
```bash
# Start production environment
make docker-prod

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📋 Available Commands

```bash
make help          # Show all commands
make install       # Install dependencies
make dev          # Start development
make build        # Build projects
make test         # Run tests
make clean        # Clean everything
make docker-dev   # Docker development
make docker-prod  # Docker production
make docker-down  # Stop containers
make logs         # Show logs
make db-migrate   # Run migrations
make db-seed      # Seed database
make db-reset     # Reset database
```

## 🔧 Environment Variables

### Development (.env.docker.dev)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres_proposal:postgres_proposal@database:5432/proposal_db?schema=public
API_PORT=3001
WEB_PORT=3000
```

### Production (.env.docker)
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres_proposal:postgres_proposal@database:5432/proposal_db?schema=public
API_PORT=3001
WEB_PORT=3000
```

## 🏗️ Build Process

1. **Install**: Install all dependencies
2. **Generate**: Generate Prisma client
3. **Build**: Build API and Web projects
4. **Migrate**: Run database migrations
5. **Seed**: Seed database with initial data
6. **Start**: Start services

## 📊 Monitoring

### Health Checks
- **Database**: `pg_isready` check
- **API**: Health endpoint at `/health`
- **Web**: Next.js health check

### Logs
```bash
# Development logs
make logs

# Specific service logs
docker-compose -f docker-compose.dev.yaml logs api
docker-compose -f docker-compose.dev.yaml logs web
docker-compose -f docker-compose.dev.yaml logs database
```

## 🚀 CI/CD

### GitHub Actions
- **Test**: Run tests with PostgreSQL
- **Build**: Build all projects
- **Docker**: Build and push Docker images
- **Deploy**: Deploy to production

### Secrets Required
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 3001, 5432 are free
2. **Database connection**: Ensure PostgreSQL is running
3. **Prisma errors**: Run `make db-migrate` to fix schema issues
4. **Build failures**: Check Docker daemon is running

### Reset Everything
```bash
make clean
make docker-dev
```

## 📁 File Structure

```
├── Dockerfile                 # Multi-stage build
├── docker-compose.dev.yaml   # Development setup
├── docker-compose.prod.yml   # Production setup
├── entrypoint.sh             # Auto-migrate & seed
├── Makefile                  # Convenience commands
├── .dockerignore            # Docker ignore rules
└── .github/workflows/       # CI/CD pipelines
```
