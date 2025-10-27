# Proposal Management System

A modern proposal management system built with NestJS API and Next.js frontend, managed with pnpm workspace.

## 🏗️ Project Structure

```
proposal/
├── api/                    # NestJS API backend
├── web/                    # Next.js frontend
├── packages/               # Shared packages
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── logger/            # Shared logger package
│   ├── shared-types/      # Shared TypeScript types
│   └── tsconfig/          # Shared TypeScript configurations
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8.15.0 or higher)

### Installation

```bash
# Install dependencies for all projects
pnpm install

# Or use the alias
pnpm run install:all
```

## 📦 Available Scripts

### Root Level Commands

```bash
# Build all projects
pnpm run build

# Start development servers for all projects
pnpm run dev

# Start all projects in development mode
pnpm run start:dev

# Run tests for all projects
pnpm run test

# Run linting for all projects
pnpm run lint

# Format code
pnpm run format

# Clean all node_modules
pnpm run clean
```

### Individual Project Commands

```bash
# API (NestJS) specific commands
pnpm run start:api          # Start API server
pnpm --filter api start:dev # Start API in development mode
pnpm --filter api test      # Run API tests

# Web (Next.js) specific commands
pnpm run start:web          # Start web development server
pnpm --filter web build     # Build web project
pnpm --filter web test      # Run web tests
```

## 🛠️ Development

### Start Development Servers

```bash
# Start all projects in development mode
pnpm run dev

# Or start them individually
pnpm run start:api  # API server (usually port 3000)
pnpm run start:web  # Web server (usually port 3001)
```

### Building for Production

```bash
# Build all projects
pnpm run build

# Build individual projects
pnpm --filter api build
pnpm --filter web build
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests for specific project
pnpm --filter api test
pnpm --filter web test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov
```

## 📁 Workspace Management

This project uses pnpm workspaces for monorepo management. The workspace is configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'api'
  - 'web'
  - 'packages/*'
```

### Adding Dependencies

```bash
# Add dependency to root
pnpm add <package>

# Add dependency to specific project
pnpm --filter api add <package>
pnpm --filter web add <package>

# Add dev dependency
pnpm --filter api add -D <package>
```

## 🔧 Configuration

- **pnpm**: Configured in `.npmrc`
- **TypeScript**: Shared configs in `packages/tsconfig/`
- **ESLint**: Shared config in `packages/eslint-config/`
- **Prettier**: Configured at root level

## 📝 Project Features

### API (NestJS)
- RESTful API endpoints
- Authentication & Authorization
- Database integration with Prisma
- File upload handling
- Email notifications
- Proposal management
- Template system
- Digital signatures

### Web (Next.js)
- Modern React frontend
- Dashboard interface
- Authentication pages
- Proposal management UI
- Template editor
- Settings pages
- Public proposal views

## 🐳 Docker Development

### Prerequisites
- Docker and Docker Compose installed
- pnpm (for local development)

### Development with Docker

```bash
# Start development environment with hot reload
pnpm run docker:dev

# Stop development environment
pnpm run docker:down:dev

# View logs
docker-compose -f docker-compose.dev.yaml logs -f
```

### Production with Docker

```bash
# Build and start production environment
pnpm run docker:prod

# Stop production environment
pnpm run docker:down
```

### Database Management

```bash
# Generate Prisma client
pnpm run prisma:generate

# Run database migrations
pnpm run prisma:migrate

# Seed database
pnpm run prisma:seed

# Open Prisma Studio
pnpm --filter api prisma:studio
```

## 🚀 Deployment

### Local Development
```bash
# Build for production
pnpm run build

# Start production servers
pnpm run start
```

### Docker Production
```bash
# Build and start with Docker
pnpm run docker:prod
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Documentation](https://pnpm.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.
