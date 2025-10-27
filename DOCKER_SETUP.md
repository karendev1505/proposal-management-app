# Docker Setup Guide

Цей файл містить інструкції для роботи з Docker у вашому монорепозиторії.

## 🏗️ Структура Docker файлів

```
proposal/
├── Dockerfile                    # Multi-stage Dockerfile
├── docker-compose.yaml          # Production Docker Compose
├── docker-compose.dev.yaml      # Development Docker Compose
├── entrypoint.sh                # Entrypoint script
├── .dockerignore                # Docker ignore file
└── devops/
    ├── .env.docker              # Production environment variables
    └── .env.docker.dev          # Development environment variables
```

## 🚀 Швидкий старт

### Розробка з Docker

```bash
# Запустити development environment
pnpm run docker:dev

# Зупинити development environment
pnpm run docker:down:dev

# Переглянути логи
docker-compose -f docker-compose.dev.yaml logs -f
```

### Production з Docker

```bash
# Запустити production environment
pnpm run docker:prod

# Зупинити production environment
pnpm run docker:down
```

## 🔧 Налаштування

### Environment Variables

Оновіть файли в `devops/` з вашими налаштуваннями:

- `devops/.env.docker.dev` - для розробки
- `devops/.env.docker` - для продакшну

### База даних

Проект використовує PostgreSQL з Prisma ORM:

```bash
# Генерувати Prisma клієнт
pnpm run prisma:generate

# Запустити міграції
pnpm run prisma:migrate

# Засідити базу даних
pnpm run prisma:seed

# Відкрити Prisma Studio
pnpm --filter api prisma:studio
```

## 📦 Docker Images

### Development Image
- Базується на Node.js 22.14.0
- Включає всі dev залежності
- Hot reload для розробки
- Expose порти: 3000 (API), 3001 (Web), 5556 (Prisma Studio)

### Production Image
- Мінімальний образ на базі node:22.14.0-slim
- Тільки production залежності
- Оптимізований для продакшну

## 🛠️ Команди

### Docker команди
```bash
# Development
pnpm run docker:dev              # Запустити dev environment
pnpm run docker:down:dev          # Зупинити dev environment

# Production
pnpm run docker:prod              # Запустити prod environment
pnpm run docker:down              # Зупинити prod environment
```

### Prisma команди
```bash
pnpm run prisma:generate          # Генерувати Prisma клієнт
pnpm run prisma:migrate           # Запустити міграції
pnpm run prisma:seed              # Засідити базу даних
```

## 🔍 Troubleshooting

### Проблеми з портами
Якщо порти зайняті, змініть їх у docker-compose файлах:
- API: 3000
- Web: 3001
- Database: 5432
- Prisma Studio: 5556

### Проблеми з базою даних
```bash
# Перезапустити тільки базу даних
docker-compose -f docker-compose.dev.yaml restart database

# Переглянути логи бази даних
docker-compose -f docker-compose.dev.yaml logs database
```

### Очищення Docker
```bash
# Видалити всі контейнери та volumes
docker-compose -f docker-compose.dev.yaml down -v
docker-compose down -v

# Очистити Docker cache
docker system prune -a
```

## 📝 Нотатки

- Development environment включає hot reload
- Production environment оптимізований для продакшну
- База даних автоматично мігрується при запуску
- Seed дані додаються автоматично в development
- Всі environment variables налаштовуються через .env файли
