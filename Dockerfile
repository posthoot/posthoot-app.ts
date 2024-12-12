# 🌟 Stage 1: Install dependencies and build the application 🌟
# ============================================================

FROM oven/bun:canary-alpine AS builder

RUN echo "🔮 ✨ Installing system dependencies..." && \
    apk add --no-cache nodejs npm git

# 📂 Set working directory 📂
# ==========================

WORKDIR /app


# 📚 Copy package files 📚
# ======================

COPY package.json package-lock.json ./


# 📦 Install dependencies 📦
# ========================

RUN echo "🎭 ✨ Installing project dependencies..." && \
    bun install


# 💫 Copy source code 💫
# ====================

COPY . .


# 🏗️ Build application 🏗️
# ======================

RUN echo "🚀 ✨ Building Next.js application..." && \
    bun build


# 🌠 Stage 2: Production image 🌠
# ==============================

FROM oven/bun:canary-alpine AS production


# 📂 Set production directory 📂
# ============================

WORKDIR /app


# 📋 Copy build artifacts 📋
# ========================

RUN echo "🎪 ✨ Preparing production environment..."

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/package.json ./


# 🔌 Configure port 🔌
# ==================

EXPOSE 3000


# 🚀 Launch application 🚀
# ======================

CMD ["bun", "start"]