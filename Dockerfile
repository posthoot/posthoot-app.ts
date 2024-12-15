# 🌟 Stage 1: Install dependencies and build the application 🌟
# ============================================================

FROM oven/bun:canary-alpine AS builder

RUN echo "🔮 ✨ Why did the dependency feel lonely? Because nobody would require it! 😄" && \
    apk add --no-cache nodejs git build-base python3 make npm

# 📂 Set working directory 📂
# ==========================

WORKDIR /app


# 📚 Copy package files 📚
# ======================

COPY package.json package-lock.json ./


# 📦 Install dependencies 📦
# ========================

RUN echo "🎭 ✨ What did npm say to the package? I node you from somewhere! 🤣" && \
    bun install


# 💫 Copy source code 💫
# ====================

COPY . .


# 🏗️ Build application 🏗️
# ======================

RUN echo "🚀 ✨ Why did the Next.js build take so long? It was taking a page break! 😆" && \
    bun run build


# 🌠 Stage 2: Production image 🌠
# ==============================

FROM oven/bun:canary-alpine AS production


# 📂 Set production directory 📂
# ============================

WORKDIR /app


# 📋 Copy build artifacts 📋
# ========================

RUN echo "🎪 ✨ Why did the Docker container feel claustrophobic? Because it was packed in production! 🎭"

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/package.json ./


# 🔌 Configure port 🔌
# ==================

EXPOSE 3000


# 🚀 Launch application 🚀
# ======================

CMD ["bun", "run", "start"]