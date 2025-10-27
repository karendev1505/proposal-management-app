# 1) Base: pin Node & pnpm ########################################
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION} AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

########################################
# 2) Builder: install prod deps & build ########################################
FROM base AS builder

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace dependencies
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY packages/*/package.json ./packages/*/

# Install ALL dependencies (including devDependencies) for the build
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build all projects
RUN cd api && pnpm prisma generate && cd .. && pnpm build

########################################
# 3) Development stage (hot-reload) ########################################
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY packages/*/package.json ./packages/*/

# Install all dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd api && pnpm prisma generate && cd .. && chmod +x entrypoint.sh

EXPOSE 3000 3001 3001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm", "dev"]

########################################
# 4) Runner: minimal production image ########################################
FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install runtime dependencies for Prisma (OpenSSL), PostgreSQL client, and corepack for pnpm
RUN apt-get update -y && apt-get install -y openssl postgresql-client \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY packages/*/package.json ./packages/*/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built output from builder
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/web/.next ./web/.next
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/web/src ./web/src
COPY --from=builder /app/api/src ./api/src
COPY --from=builder /app/api/prisma ./api/prisma
COPY --from=builder /app/packages ./packages

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000 3001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm", "start"]
