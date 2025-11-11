# Health Checks and Development Tools

## Health Check Endpoints

The application provides several health check endpoints to monitor its status:

- `/health` - Overall application health check
- `/health/db` - Database connectivity check
- `/health/test-auth-email` - Authentication and email service configuration check

### Response Format

```json
{
  "status": "up" | "down",
  "details": {
    "prisma": {
      "status": "up" | "down",
      "error": "error message" // Only present if status is "down"
    },
    "email": {
      "status": "up" | "down",
      "message": "configuration status message"
    },
    "auth": {
      "status": "up" | "down",
      "message": "configuration status message"
    }
  }
}
```

## Development Tools

### Prisma Studio

Prisma Studio is available in development mode on port 5556. To access it:

1. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yaml up
   ```

2. Access Prisma Studio at:
   ```
   http://localhost:5556
   ```

This provides a visual interface to view and manage your database.

## Logging

The application uses NestJS's built-in logging system with the following features:

- Request logging (HTTP method, path, status code, response time)
- Service-level logging for important operations
- Error tracking with stack traces
- Log levels: error, warn, log, debug

### Log Format

```typescript
[Nest] 1234 - YYYY/MM/DD HH:mm:ss     LOG [Service] Message
[Nest] 1234 - YYYY/MM/DD HH:mm:ss    WARN [Service] Warning message
[Nest] 1234 - YYYY/MM/DD HH:mm:ss   ERROR [Service] Error message
```

### Environment-specific Logging

- Development: All log levels, formatted for readability
- Production: Error and warning logs only, JSON format for better parsing

To view logs in Docker:
```bash
# Development
docker-compose -f docker-compose.dev.yaml logs -f

# Production
docker-compose -f docker-compose.prod.yml logs -f
```
