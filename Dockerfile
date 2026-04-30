# ======================
# Install dependencies
# ======================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci


# ======================
# Build app
# ======================
FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api
ARG BACKEND_API_URL=http://host.docker.internal:3001
ARG NEXT_PUBLIC_API_TIMEOUT=30000
ARG NEXT_PUBLIC_LOG_API_REQUESTS=true

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NEXT_PUBLIC_API_TIMEOUT=${NEXT_PUBLIC_API_TIMEOUT}
ENV NEXT_PUBLIC_LOG_API_REQUESTS=${NEXT_PUBLIC_LOG_API_REQUESTS}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ======================
# Run app (IMPORTANT)
# ======================
FROM node:22-alpine AS runner
WORKDIR /app

# Accept build args for the runner stage
ARG NEXT_PUBLIC_API_URL=/api
ARG BACKEND_API_URL=http://host.docker.internal:3001
ARG NEXT_PUBLIC_API_TIMEOUT=30000
ARG NEXT_PUBLIC_LOG_API_REQUESTS=true

# Set environment variables for runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NEXT_PUBLIC_API_TIMEOUT=${NEXT_PUBLIC_API_TIMEOUT}
ENV NEXT_PUBLIC_LOG_API_REQUESTS=${NEXT_PUBLIC_LOG_API_REQUESTS}

COPY --from=builder /app ./

EXPOSE 3000

# Run with proper signal handling
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
