# API Documentation - ITSM Platform

Base URL: `/api/v1`

## Authentication

All API endpoints (except auth endpoints) require authentication via Bearer token.

### Headers
```
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
```

---

## Authentication Endpoints

### POST `/auth/signup`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "tenantSlug": "my-company"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### POST `/auth/signin`
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST `/auth/logout`
Sign out current user.

### POST `/auth/refresh`
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

---

## Tenant Endpoints

### GET `/tenants/my`
Get current user's tenants.

### POST `/tenants`
Create a new tenant.

**Request:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "settings": {}
}
```

### GET `/tenants/:id`
Get tenant by ID.

### PUT `/tenants/:id`
Update tenant.

### DELETE `/tenants/:id`
Soft delete tenant.

### GET `/tenants/:id/members`
Get tenant members.

### POST `/tenants/:id/members`
Add member to tenant.

### DELETE `/tenants/:id/members/:userId`
Remove member from tenant.

---

## User Endpoints

### GET `/users/me`
Get current user profile.

### PUT `/users/me`
Update current user profile.

**Request:**
```json
{
  "fullName": "John Updated",
  "avatarUrl": "https://..."
}
```

### GET `/users`
Search users in tenant.

**Query Params:**
- `q` - Search query
- `limit` - Max results (default: 20)

### GET `/users/:id`
Get user by ID.

### GET `/users/by-role/:role`
Get users by role in tenant.

---

## Tickets Endpoints

### GET `/tickets`
List tickets with filters.

**Query Params:**
- `type` - incident | request | problem | change
- `status` - Comma-separated status values
- `priority` - Comma-separated priority values
- `assignee` - User ID
- `reporter` - User ID
- `search` - Search in title/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by
- `sortOrder` - asc | desc

**Response:**
```json
{
  "data": [...],
  "total": 150
}
```

### GET `/tickets/stats`
Get ticket statistics.

**Query Params:**
- `type` - Filter by ticket type

**Response:**
```json
{
  "total": 150,
  "byStatus": {
    "new": 10,
    "in_progress": 25,
    "pending": 5,
    "resolved": 100,
    "closed": 10
  },
  "byPriority": {
    "critical": 2,
    "high": 15,
    "medium": 80,
    "low": 53
  },
  "overdue": 5
}
```

### POST `/tickets`
Create a new ticket.

**Request:**
```json
{
  "type": "incident",
  "title": "Email server down",
  "description": "The primary email server is not responding...",
  "priority": "high",
  "impact": "high",
  "urgency": "medium",
  "assigneeId": "uuid",
  "categoryId": "uuid",
  "customFields": {},
  "tags": ["email", "server", "critical"]
}
```

### GET `/tickets/:id`
Get ticket by ID.

**Response:**
```json
{
  "id": "uuid",
  "ticketNumber": "INC-2026-00001",
  "type": "incident",
  "status": "in_progress",
  "priority": "high",
  "impact": "high",
  "urgency": "medium",
  "title": "Email server down",
  "description": "...",
  "reporter": { "id": "uuid", "email": "...", "fullName": "..." },
  "assignee": { "id": "uuid", "email": "...", "fullName": "..." },
  "sla": { "id": "uuid", "name": "Standard SLA", ... },
  "comments": [...],
  "relations": [...],
  "openedAt": "2026-04-07T10:00:00Z",
  "createdAt": "2026-04-07T10:00:00Z",
  "updatedAt": "2026-04-07T10:30:00Z"
}
```

### PUT `/tickets/:id`
Update ticket.

**Request:**
```json
{
  "title": "Updated title",
  "priority": "critical",
  "status": "in_progress",
  "assigneeId": "uuid",
  "resolutionNotes": "Fixed by restarting service"
}
```

### POST `/tickets/:id/transition/:toStatus`
Transition ticket to a new status.

### POST `/tickets/:id/comments`
Add comment to ticket.

**Request:**
```json
{
  "content": "Investigating the issue...",
  "visibility": "internal"
}
```

### GET `/tickets/:id/comments`
Get ticket comments.

### POST `/tickets/:id/link`
Link tickets.

**Request:**
```json
{
  "targetTicketId": "uuid",
  "relationType": "blocks"
}
```

---

## Incidents Endpoints

### POST `/incidents`
Create a new incident.

**Request:**
```json
{
  "title": "Website unavailable",
  "description": "The company website is returning 500 errors",
  "priority": "critical",
  "impact": "high",
  "urgency": "high",
  "affectedServices": ["website", "api"]
}
```

### GET `/incidents/stats`
Get incident-specific statistics.

### GET `/incidents/unassigned`
Get unassigned incidents.

---

## Requests Endpoints

### POST `/requests`
Create a service request.

### GET `/requests/stats`
Get request statistics.

---

## Problems Endpoints

### GET `/problems`
List all problems.

### POST `/problems`
Create a new problem.

**Request:**
```json
{
  "title": "Database connection pool exhaustion",
  "description": "Multiple incidents related to database timeouts",
  "priority": "high",
  "relatedIncidentIds": ["uuid1", "uuid2"]
}
```

### GET `/problems/:id`
Get problem by ID.

### PUT `/problems/:id`
Update problem.

### GET `/problems/kedb/search?q=query`
Search known errors database.

### GET `/problems/kedb`
List all known errors.

### POST `/problems/kedb`
Create known error.

---

## Changes Endpoints

### GET `/changes`
List all changes.

### POST `/changes`
Create change request.

**Request:**
```json
{
  "type": "normal",
  "title": "Upgrade database to v15",
  "description": "Upgrade PostgreSQL from v14 to v15",
  "justification": "Security patches and performance improvements",
  "implementationPlan": "1. Backup database\n2. Run upgrade script...",
  "rollbackPlan": "Restore from backup",
  "plannedStartAt": "2026-04-10T02:00:00Z",
  "plannedEndAt": "2026-04-10T04:00:00Z",
  "requiresCab": true,
  "affectedServices": ["database", "api"]
}
```

### GET `/changes/:id`
Get change by ID.

### PUT `/changes/:id`
Update change request.

### POST `/changes/:id/submit`
Submit change for approval.

### POST `/changes/:id/schedule-cab`
Schedule CAB meeting.

**Request:**
```json
{
  "meetingDate": "2026-04-08T14:00:00Z"
}
```

### POST `/changes/:id/cab-decision`
Record CAB decision.

**Request:**
```json
{
  "memberId": "uuid",
  "vote": "approve",
  "comments": "Looks good, approved"
}
```

### POST `/changes/:id/implement`
Start implementing change.

### POST `/changes/:id/complete`
Complete change implementation.

### GET `/changes/cab/members`
Get CAB members.

### POST `/changes/cab/members`
Add CAB member.

### GET `/changes/calendar?start=2026-04-01&end=2026-04-30`
Get change calendar.

---

## Workflows Endpoints

### GET `/workflows`
Get all workflows for tenant.

### GET `/workflows/default/:type`
Get default workflow for entity type.

### GET `/workflows/:id`
Get workflow by ID.

### POST `/workflows`
Create custom workflow.

### PUT `/workflows/:id`
Update workflow.

### POST `/workflows/:id/set-default`
Set workflow as default.

### DELETE `/workflows/:id`
Delete workflow.

---

## SLAs Endpoints

### GET `/slas`
Get all SLAs for tenant.

### GET `/slas/:id`
Get SLA by ID.

### POST `/slas`
Create SLA policy.

**Request:**
```json
{
  "name": "Critical Incident SLA",
  "description": "4 hour response, 24 hour resolution",
  "applyToType": ["incident"],
  "applyToPriority": ["critical", "high"],
  "responseTimeHours": 4,
  "resolutionTimeHours": 24
}
```

### PUT `/slas/:id`
Update SLA.

### DELETE `/slas/:id`
Delete SLA (soft delete).

---

## Services Endpoints

### GET `/services`
Get all services.

### GET `/services/featured`
Get featured services.

### GET `/services/search?q=query`
Search services.

### GET `/services/:id`
Get service by ID.

### POST `/services`
Create service.

### PUT `/services/:id`
Update service.

### DELETE `/services/:id`
Delete service.

### GET `/services/categories/list`
Get all categories.

### POST `/services/categories`
Create category.

---

## Integrations Endpoints

### GET `/integrations`
Get all integrations.

### GET `/integrations/:id`
Get integration by ID.

### POST `/integrations`
Create integration.

### PUT `/integrations/:id`
Update integration.

### DELETE `/integrations/:id`
Delete integration.

### POST `/integrations/:id/test`
Test integration connection.

### GET `/integrations/:id/logs`
Get integration logs.

### POST `/integrations/:id/trigger`
Trigger webhook manually.

---

## Notifications Endpoints

### GET `/notifications`
Get user notifications.

### GET `/notifications/templates`
Get notification templates.

### POST `/notifications/templates`
Create notification template.

### PUT `/notifications/:id/read`
Mark notification as read.

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
