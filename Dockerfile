FROM oven/bun:canary-alpine

RUN apk add --no-cache nodejs npm git

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun next telemetry disable
RUN npx prisma generate
RUN npx prisma migrate deploy

RUN bun run build