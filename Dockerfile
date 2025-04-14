# 🌟 Stage 1: Install dependencies and build the application 🌟
# ============================================================

FROM oven/bun:latest AS builder

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

FROM oven/bun:latest AS production

# 📂 Set production directory 📂
# ============================

WORKDIR /app


# 📋 Copy build artifacts 📋
# ========================

RUN echo "🎪 ✨ Why did the Docker container feel claustrophobic? Because it was packed in production! 🎭"


# Copy standalone output which contains minimal production files
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public files which aren't included in standalone by default
COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/static ./.next/static

# Copy bcryptjs and dotenv from builder stage 🦆
# ====================================================

COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# 🔌 Configure port 🔌
# ==================

EXPOSE 3000

# 🚀 Launch application 🚀
# ======================

CMD ["bunx", "server.js"]