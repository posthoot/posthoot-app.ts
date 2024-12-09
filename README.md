# SailMail - Enterprise Email Orchestration Platform

<div align="center">
  <img src="public/sailer.svg" alt="SailMail Logo" />
  <p><em>First-class email automation for modern enterprises</em></p>
</div>

![SailMail Demo](public/preview.png)

## Overview

🚢 SailMail is an enterprise-grade email orchestration platform that helps businesses automate their email workflows, manage contact lists, and deliver personalized communications at scale. Built with modern technologies and designed for performance.

## Architecture

```mermaid
graph TD
    Client[Client Browser] --> NextAuth[NextAuth.js Authentication]
    NextAuth --> API[Next.js API Routes]
    API --> ContactsService[Contacts Service]
    API --> EmailService[Email Service]
    API --> ListService[Mailing List Service]
    
    ContactsService --> Prisma[Prisma ORM]
    EmailService --> Prisma
    ListService --> Prisma
    
    Prisma --> PostgreSQL[(PostgreSQL)]
    EmailService --> Redis[(Redis Cache)]
    
    subgraph Services
        ContactsService
        EmailService
        ListService
    end
    
    subgraph Data Layer
        PostgreSQL
        Redis
    end
```

## Core Features

### Contact Management
- **Contact Lists**
  - Create and manage multiple contact lists
  - Smart segmentation and filtering
  - Bulk contact import/export
  - Custom fields and attributes
  - Contact activity tracking

### Email Automation
- **Campaign Management**
  - Template-based email creation
  - Dynamic variable injection
  - Smart queue processing
  - Automated retry logic
  - Scheduled sending

### Team Collaboration
- **Workspace Management**
  - Role-based access control (RBAC)
  - Team workspaces
  - Activity audit logging
  - Collaborative template editing

### Analytics & Monitoring
- **Performance Insights**
  - Delivery analytics
  - Engagement metrics
  - Bounce tracking
  - Real-time dashboards
  - A/B testing analytics

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Shadcn/ui Components

### Backend
- Next.js Edge Runtime
- Prisma ORM
- NextAuth.js
- API Routes

### Infrastructure
- PostgreSQL 16
- Redis 7
- Docker
- Docker Compose

### Development
- Bun Package Manager
- ESLint
- Prettier
- Husky
- Jest

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
git clone https://github.com/your-org/sailmail.git
cd sailmail
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
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/sailmail
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email Service
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Project Structure

```
sailmail/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── contacts/          # Contact management pages
│   └── email/            # Email management pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and shared logic
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Testing

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

For support, email me@iamharsh.dev or join our Discord community.

## Security

Please report security vulnerabilities to me@iamharsh.dev

## Acknowledgments

- Next.js team for the amazing framework
- Our contributors and community
- All open-source projects that made this possible

---

<div align="center">
  <p>Made with ❤️ by the SailMail Team</p>
</div>
