# Deployment Guide

This guide covers deployment options for the ITSM Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Vercel (Frontend)](#vercel-frontend)
4. [AWS Deployment](#aws-deployment)
5. [GCP Deployment](#gcp-deployment)
6. [Environment Variables](#environment-variables)

---

## Prerequisites

- Docker and Docker Compose
- Supabase project with migrations applied
- Redis instance (local or cloud like Redis Cloud, AWS ElastiCache)
- Domain name (for production)

---

## Docker Deployment

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

1. Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: your-registry/itsm-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=https://your-domain.com
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  frontend:
    image: your-registry/itsm-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: always
```

2. Build and push images:

```bash
# Build backend
docker build -t your-registry/itsm-backend:latest .

# Build frontend
docker build -t your-registry/itsm-frontend:latest ./frontend

# Push to registry
docker push your-registry/itsm-backend:latest
docker push your-registry/itsm-frontend:latest
```

3. Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Vercel (Frontend)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Select the `frontend` folder as root

### 2. Configure Environment Variables

In Vercel dashboard, add:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy

Vercel will automatically deploy on push to main branch.

### 4. Custom Domain

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS as instructed

---

## AWS Deployment

### ECS (Elastic Container Service)

1. **Create ECR Repositories**

```bash
aws ecr create-repository --repository-name itsm-backend
aws ecr create-repository --repository-name itsm-frontend
```

2. **Push Images**

```bash
# Backend
docker build -t itsm-backend .
docker tag itsm-backend:latest <account-id>.dkr.ecr.region.amazonaws.com/itsm-backend:latest
docker push <account-id>.dkr.ecr.region.amazonaws.com/itsm-backend:latest

# Frontend
docker build -t itsm-frontend ./frontend
docker tag itsm-frontend:latest <account-id>.dkr.ecr.region.amazonaws.com/itsm-frontend:latest
docker push <account-id>.dkr.ecr.region.amazonaws.com/itsm-frontend:latest
```

3. **Create ECS Cluster**

```bash
aws ecs create-cluster --cluster-name itsm-cluster
```

4. **Create Task Definitions**

Create `backend-task.json`:

```json
{
  "family": "itsm-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "itsm-backend",
      "image": "<account-id>.dkr.ecr.region.amazonaws.com/itsm-backend:latest",
      "portMappings": [{ "containerPort": 3001 }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "SUPABASE_URL", "value": "your-supabase-url" }
      ],
      "secrets": [
        { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..." }
      ]
    }
  ]
}
```

```bash
aws ecs register-task-definition --cli-input-json file://backend-task.json
```

5. **Create Service**

```bash
aws ecs create-service \
  --cluster itsm-cluster \
  --service-name itsm-backend \
  --task-definition itsm-backend \
  --desired-count 1 \
  --launch-type FARGATE
```

### Alternative: AWS App Runner

Simpler option for containerized applications:

```bash
aws apprunner create-service \
  --service-name itsm-backend \
  --source-configuration ImageRepository=uri=<ecr-image-uri>
```

---

## GCP Deployment

### Cloud Run

1. **Build and Push to Artifact Registry**

```bash
# Enable APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Create repository
gcloud artifacts repositories create itsm-repo --repository-format=docker --location=us-central1

# Build and push
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/itsm-repo/itsm-backend
```

2. **Deploy to Cloud Run**

```bash
gcloud run deploy itsm-backend \
  --image us-central1-docker.pkg.dev/PROJECT_ID/itsm-repo/itsm-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,SUPABASE_URL=xxx \
  --set-secrets JWT_SECRET=jwt-secret:latest
```

### Cloud SQL (Optional - if self-hosting PostgreSQL)

```bash
gcloud sql instances create itsm-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-1-3840 \
  --region=us-central1
```

---

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `REDIS_URL` | Redis connection URL | Yes |
| `LOG_LEVEL` | Logging level | No (default: info) |
| `QUEUE_PREFIX` | Bull queue prefix | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |

---

## Monitoring & Observability

### Health Checks

- Backend: `GET /health` (implement in `app.module.ts`)
- Frontend: `GET /` returns 200

### Logging

Backend uses Winston logger. Logs are written to:
- Console (stdout)
- `logs/combined.log`
- `logs/error.log`

### Metrics to Monitor

- API response times
- Error rates
- Queue depth
- Cache hit rates
- Database query times

### Alerts to Configure

- High error rate (>1%)
- Slow response times (p95 > 500ms)
- SLA breaches
- Queue failures

---

## Backup & Recovery

### Database Backups

Supabase handles automatic backups. Configure in Supabase dashboard:
- Daily backups
- Point-in-time recovery

### Redis Backups

Redis data is ephemeral. Don't back up cache data.

### Disaster Recovery

1. Have Supabase project backed up
2. Document all environment variables
3. Keep Docker images in registry
4. Test recovery procedure regularly

---

## Scaling

### Horizontal Scaling

- Deploy multiple backend instances behind load balancer
- Redis Cluster for high availability
- Supabase connection pooling (PgBouncer)

### Vertical Scaling

- Increase container memory/CPU limits
- Upgrade Supabase plan
- Use Redis with more memory

### Auto-scaling (AWS Example)

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/itsm-cluster/itsm-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 4
```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Rotate JWT secrets regularly
- [ ] Enable Supabase RLS on all tables
- [ ] Use environment variables for secrets
- [ ] Enable WAF (Web Application Firewall)
- [ ] Set up DDoS protection
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor for suspicious activity
