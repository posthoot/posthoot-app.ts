FROM oven/bun:canary-alpine

RUN apk add --no-cache nodejs npm git

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun next telemetry disable

RUN bun run build