# SailMail - Enterprise Email Orchestration Platform

<div align="center">
  <img src="public/logo.jpeg" alt="SailMail Logo" />
  <p><em>Advanced Email Orchestration for Modern Enterprises</em></p>
</div>

## Overview

SailMail is an enterprise-grade email orchestration platform built with cutting-edge technologies. It provides a robust foundation for managing complex email workflows, team collaboration, and automated dispatch systems.

## Core Features

- **Intelligent Email Orchestration**

  - Template Management
  - Dynamic Variable Injection
  - Smart Queue Processing
  - Automated Retry Logic

- **Team Collaboration**

  - Role-Based Access Control
  - Team Workspaces
  - Audit Logging
  - Real-time Collaboration

- **Analytics & Monitoring**
  - Delivery Analytics
  - Engagement Metrics
  - Performance Monitoring
  - Real-time Dashboards

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js Edge Runtime, Prisma
- **Database**: PostgreSQL 16
- **Caching**: Redis 7
- **Authentication**: NextAuth.js
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Bun 1.0.x or higher
- Docker and Docker Compose
- PostgreSQL 16
- Redis 7

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/nexus-dispatch.git
cd nexus-dispatch
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Start the development environment:

```bash
docker-compose up -d
bun dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexus
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Testing

We maintain comprehensive test coverage using Jest and React Testing Library:

```bash
# Run unit tests
bun test

# Run integration tests
bun test:integration

# Run e2e tests
bun test:e2e
```

## Deployment

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
bun run build
bun run start
```

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email me@iamharsh.dev or join our Slack community.

## Security

Please report security vulnerabilities to me@iamharsh.dev

## Acknowledgments

- Next.js team for the amazing framework
- Our contributors and community
- All open-source projects that made this possible

---

<div align="center">
  <p>Made with ❤️ by the @fofsinx Team</p>
</div>
