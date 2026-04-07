# ITSM Platform

A modern, scalable IT Service Management (ITSM) platform built with NestJS, Next.js, and Supabase.

## Features

- **Incident Management** - Track and resolve incidents quickly
- **Service Requests** - Handle user requests with customizable workflows
- **Problem Management** - Identify root causes with Known Errors Database (KEDB)
- **Change Management** - Manage changes safely with CAB workflows
- **Service Catalog** - Publish and manage IT services
- **Workflow Engine** - Configurable workflows per entity type
- **SLA Management** - Define and track service level agreements
- **Integrations** - Webhook and REST API integrations
- **Multi-tenancy** - Secure tenant isolation with Row Level Security

## Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Cache:** Redis
- **Queue:** Bull (Redis-based)
- **Auth:** JWT + Supabase Auth

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** TailwindCSS
- **State:** Zustand
- **Data Fetching:** React Query (optional)
- **UI Components:** Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (free tier works)
- Redis (local or cloud)

### 1. Clone Repository

```bash
git clone <repository-url>
cd app-itsm-manager
```

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from `docs/DATABASE_SCHEMA.md` in the Supabase SQL Editor
3. Get your credentials from Settings > API

### 3. Configure Backend

```bash
cd backend
cp .env.example .env.local
```

Edit `.env.local`:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=generate-a-secure-secret
REDIS_URL=redis://localhost:6379
```

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
brew install redis  # macOS
redis-server
```

### 6. Install Dependencies & Run

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 7. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/docs

## Project Structure

```
app-itsm-manager/
├── backend/
│   ├── src/
│   │   ├── common/           # Shared utilities, guards, decorators
│   │   ├── config/           # Configuration files
│   │   ├── infrastructure/   # Database, cache, queue
│   │   └── modules/          # Feature modules
│   │       ├── auth/
│   │       ├── tenant/
│   │       ├── user/
│   │       ├── ticket/
│   │       ├── incident/
│   │       ├── request/
│   │       ├── problem/
│   │       ├── change/
│   │       ├── workflow/
│   │       ├── sla/
│   │       ├── integration/
│   │       └── notification/
│   └── test/
│
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router pages
│       ├── components/       # React components
│       ├── lib/              # Utilities, API client
│       ├── store/            # Zustand stores
│       └── types/            # TypeScript types
│
├── docs/
│   ├── DATABASE_SCHEMA.md    # Full database schema
│   └── API_DOCUMENTATION.md  # API endpoint documentation
│
├── docker-compose.yml        # Docker Compose for local dev
└── README.md
```

## API Documentation

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API documentation.

Swagger UI is available at `http://localhost:3001/docs` when running the backend.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Supabase   │
│  (Next.js)  │     │  (NestJS)   │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                     ┌─────────────┐     ┌─────────────┐
                     │    Redis    │     │  Auth (RLS) │
                     │  (Cache)    │     │             │
                     └─────────────┘     └─────────────┘
```

### Multi-Tenancy

- Tenant isolation via Supabase Row Level Security (RLS)
- Every database query includes `tenant_id` filter
- Users can belong to multiple tenants with different roles

### Security

- JWT-based authentication
- Role-based access control (RBAC)
- Row Level Security for data isolation
- Input validation with class-validator
- Rate limiting on API endpoints

## Development

### Running Tests

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm run test
```

### Linting & Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Vercel (Frontend)

1. Connect your repository to Vercel
2. Set environment variables
3. Deploy

### AWS/GCP/Azure (Backend)

1. Build Docker image
2. Push to container registry
3. Deploy to ECS/Cloud Run/App Service

See `docs/DEPLOYMENT.md` for detailed deployment guides.

## Roadmap

- [ ] AI-powered ticket classification
- [ ] Smart SLA prediction
- [ ] Automation rules engine
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & analytics
- [ ] Knowledge base module
- [ ] Asset management (CMDB)
- [ ] Time tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.
