# Database Schema - ITSM Platform

## Multi-Tenancy Strategy

We use **Supabase Row Level Security (RLS)** for tenant isolation. Every table includes `tenant_id` and policies ensure strict data isolation.

---

## Core Tables

### 1. `tenants` (Organizations)

```sql
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status tenant_status DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
```

### 2. `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

### 3. `tenant_users` (Many-to-Many)

```sql
CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role tenant_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
```

### 4. `roles` (RBAC)

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
```

### 5. `user_roles`

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(tenant_id, user_id, role_id)
);

CREATE INDEX idx_user_roles_tenant_user ON user_roles(tenant_id, user_id);
```

---

## Ticket System Tables

### 6. `tickets` (Base Table)

```sql
CREATE TYPE ticket_type AS ENUM ('incident', 'request', 'problem', 'change');
CREATE TYPE ticket_status AS ENUM ('new', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_impact AS ENUM ('low', 'medium', 'high');
CREATE TYPE ticket_urgency AS ENUM ('low', 'medium', 'high');

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Type classification
    type ticket_type NOT NULL,
    status ticket_status NOT NULL DEFAULT 'new',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    impact ticket_impact DEFAULT 'medium',
    urgency ticket_urgency DEFAULT 'medium',
    
    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    
    -- Assignment
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID NOT NULL REFERENCES users(id),
    
    -- Categorization
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- SLA
    sla_id UUID REFERENCES slas(id),
    sla_due_at TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_reporter ON tickets(reporter_id);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_at) WHERE sla_breached = FALSE;
```

### 7. `ticket_comments`

```sql
CREATE TYPE comment_visibility AS ENUM ('public', 'internal');

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    visibility comment_visibility DEFAULT 'public',
    is_automated BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES ticket_comments(id),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_author ON ticket_comments(author_id);
```

### 8. `ticket_history` (Audit Log)

```sql
CREATE TYPE history_action AS ENUM ('created', 'updated', 'status_changed', 'assigned', 'commented', 'sla_updated');

CREATE TABLE ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action history_action NOT NULL,
    actor_id UUID REFERENCES users(id),
    field_changed VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_actor ON ticket_history(actor_id);
CREATE INDEX idx_ticket_history_action ON ticket_history(action);
```

### 9. `ticket_relations`

```sql
CREATE TYPE relation_type AS ENUM ('blocks', 'blocked_by', 'relates_to', 'caused_by', 'duplicate_of', 'has_duplicate');

CREATE TABLE ticket_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    target_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    relation_type relation_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_ticket_id, target_ticket_id, relation_type)
);

CREATE INDEX idx_ticket_relations_source ON ticket_relations(source_ticket_id);
CREATE INDEX idx_ticket_relations_target ON ticket_relations(target_ticket_id);
```

---

## SLA Tables

### 10. `slas`

```sql
CREATE TABLE slas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Conditions
    apply_to_type ticket_type[],
    apply_to_priority ticket_priority[],
    apply_to_category VARCHAR(100)[],
    
    -- Time targets (in hours)
    response_time_hours INTEGER,
    resolution_time_hours INTEGER,
    
    -- Schedule (business hours)
    schedule JSONB DEFAULT '{"type": "24x7"}',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_slas_tenant ON slas(tenant_id);
CREATE INDEX idx_slas_active ON slas(is_active);
```

### 11. `sla_breaches`

```sql
CREATE TYPE breach_type AS ENUM ('response', 'resolution');
CREATE TYPE breach_status AS ENUM ('warning', 'breached', 'avoided');

CREATE TABLE sla_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sla_id UUID NOT NULL REFERENCES slas(id),
    breach_type breach_type NOT NULL,
    status breach_status NOT NULL,
    threshold_at TIMESTAMP WITH TIME ZONE,
    breached_at TIMESTAMP WITH TIME ZONE,
    warning_threshold_percent INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_sla_breaches_status ON sla_breaches(status);
```

---

## Workflow Tables

### 12. `workflows`

```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type ticket_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    definition JSONB NOT NULL, -- Workflow definition (states, transitions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, entity_type, is_default)
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_workflows_entity ON workflows(entity_type);
```

### 13. `workflow_transitions`

```sql
CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    from_status ticket_status[],
    to_status ticket_status NOT NULL,
    conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    requires_approval BOOLEAN DEFAULT FALSE,
    approver_role_id UUID REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflow_transitions_workflow ON workflow_transitions(workflow_id);
```

### 14. `approvals`

```sql
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    workflow_transition_id UUID REFERENCES workflow_transitions(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    status approval_status NOT NULL DEFAULT 'pending',
    comments TEXT,
    decided_at TIMESTAMP WITH TIME ZONE,
    decided_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approvals_ticket ON approvals(ticket_id);
CREATE INDEX idx_approvals_status ON approvals(status);
```

---

## Problem Management Tables

### 15. `problems`

```sql
CREATE TYPE problem_status AS ENUM ('new', 'investigating', 'known_error', 'resolved', 'closed');

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status problem_status NOT NULL DEFAULT 'new',
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    root_cause TEXT,
    resolution TEXT,
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID NOT NULL REFERENCES users(id),
    priority ticket_priority DEFAULT 'medium',
    category VARCHAR(100),
    subcategory VARCHAR(100),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_problems_tenant ON problems(tenant_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_number ON problems(problem_number);
```

### 16. `known_errors` (KEDB)

```sql
CREATE TABLE known_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    workaround TEXT,
    resolution TEXT,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_known_errors_tenant ON known_errors(tenant_id);
CREATE INDEX idx_known_errors_active ON known_errors(is_active);
CREATE INDEX idx_known_errors_keywords ON known_errors USING GIN(keywords);
```

---

## Change Management Tables

### 17. `changes`

```sql
CREATE TYPE change_type AS ENUM ('standard', 'normal', 'emergency');
CREATE TYPE change_status AS ENUM ('draft', 'submitted', 'assessing', 'authorized', 'scheduled', 'implementing', 'reviewing', 'completed', 'cancelled');
CREATE TYPE change_risk AS ENUM ('low', 'medium', 'high');

CREATE TABLE changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    type change_type NOT NULL,
    status change_status NOT NULL DEFAULT 'draft',
    risk change_risk DEFAULT 'medium',
    
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    justification TEXT NOT NULL,
    
    -- Implementation details
    implementation_plan TEXT NOT NULL,
    rollback_plan TEXT NOT NULL,
    test_plan TEXT,
    
    -- Scheduling
    planned_start_at TIMESTAMP WITH TIME ZONE,
    planned_end_at TIMESTAMP WITH TIME ZONE,
    actual_start_at TIMESTAMP WITH TIME ZONE,
    actual_end_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assignee_id UUID REFERENCES users(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    
    -- CAB
    requires_cab BOOLEAN DEFAULT FALSE,
    cab_approved BOOLEAN,
    cab_meeting_date TIMESTAMP WITH TIME ZONE,
    
    -- Impact analysis
    affected_services JSONB DEFAULT '[]',
    affected_cis JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_changes_tenant ON changes(tenant_id);
CREATE INDEX idx_changes_type ON changes(type);
CREATE INDEX idx_changes_status ON changes(status);
CREATE INDEX idx_changes_risk ON changes(risk);
CREATE INDEX idx_changes_number ON changes(change_number);
CREATE INDEX idx_changes_planned ON changes(planned_start_at);
```

### 18. `cab_members`

```sql
CREATE TABLE cab_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_cab_members_tenant ON cab_members(tenant_id);
```

### 19. `cab_decisions`

```sql
CREATE TABLE cab_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_id UUID NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES cab_members(id),
    vote VARCHAR(20) NOT NULL, -- 'approve', 'reject', 'abstain'
    comments TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(change_id, member_id)
);

CREATE INDEX idx_cab_decisions_change ON cab_decisions(change_id);
```

---

## Integration Tables

### 20. `integrations`

```sql
CREATE TYPE integration_type AS ENUM ('webhook', 'rest_api', 'oauth', 'custom');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error');

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type integration_type NOT NULL,
    status integration_status DEFAULT 'active',
    config JSONB NOT NULL,
    credentials JSONB,
    webhook_secret VARCHAR(255),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
```

### 21. `integration_logs`

```sql
CREATE TYPE log_level AS ENUM ('info', 'warning', 'error', 'debug');

CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    level log_level NOT NULL,
    action VARCHAR(100) NOT NULL,
    request JSONB,
    response JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_level ON integration_logs(level);
CREATE INDEX idx_integration_logs_created ON integration_logs(created_at);
```

### 22. `webhook_events`

```sql
CREATE TYPE webhook_status AS ENUM ('pending', 'sent', 'failed', 'retrying');

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status webhook_status NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_tenant ON webhook_events(tenant_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_retry ON webhook_events(next_retry_at) WHERE status = 'retrying';
```

---

## Notification Tables

### 23. `notification_templates`

```sql
CREATE TYPE notification_channel AS ENUM ('email', 'slack', 'teams', 'webhook');
CREATE TYPE notification_trigger AS ENUM ('ticket_created', 'ticket_assigned', 'ticket_updated', 'ticket_resolved', 'sla_warning', 'sla_breached', 'approval_requested', 'approval_decided');

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type notification_trigger NOT NULL,
    channels notification_channel[] NOT NULL,
    subject_template VARCHAR(500),
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_tenant ON notification_templates(tenant_id);
CREATE INDEX idx_notification_templates_trigger ON notification_templates(trigger_type);
```

### 24. `notifications`

```sql
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    type notification_trigger NOT NULL,
    channel notification_channel NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    status notification_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
```

---

## Service Catalog Tables

### 25. `service_categories`

```sql
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_categories_tenant ON service_categories(tenant_id);
CREATE INDEX idx_service_categories_parent ON service_categories(parent_id);
```

### 26. `services`

```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    icon VARCHAR(100),
    image_url VARCHAR(500),
    
    -- Form configuration
    form_schema JSONB NOT NULL DEFAULT '[]',
    
    -- Workflow
    workflow_id UUID REFERENCES workflows(id),
    sla_id UUID REFERENCES slas(id),
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);
```

---

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_tickets_tenant_status_priority ON tickets(tenant_id, status, priority);
CREATE INDEX idx_tickets_tenant_assignee_status ON tickets(tenant_id, assignee_id, status);
CREATE INDEX idx_tickets_tenant_type_status ON tickets(tenant_id, type, status);
CREATE INDEX idx_problems_tenant_status ON problems(tenant_id, status);
CREATE INDEX idx_changes_tenant_status_planned ON changes(tenant_id, status, planned_start_at);

-- Full-text search indexes
CREATE INDEX idx_tickets_title_search ON tickets USING GIN(to_tsvector('english', title));
CREATE INDEX idx_tickets_description_search ON tickets USING GIN(to_tsvector('english', description));
CREATE INDEX idx_problems_title_search ON problems USING GIN(to_tsvector('english', title));
CREATE INDEX idx_known_errors_title_search ON known_errors USING GIN(to_tsvector('english', title));
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies for tickets table
-- Users can only see tickets from their tenant

CREATE POLICY "Users can view tickets from their tenant"
ON tickets FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert tickets in their tenant"
ON tickets FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update tickets in their tenant"
ON tickets FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete tickets in their tenant"
ON tickets FOR DELETE
USING (
    tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
);

-- Similar policies for all other tenant-scoped tables
```

---

## Supabase Functions & Triggers

### Auto-increment Ticket Number

```sql
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    counter INTEGER;
    number TEXT;
BEGIN
    -- Set prefix based on type
    CASE NEW.type
        WHEN 'incident' THEN prefix := 'INC';
        WHEN 'request' THEN prefix := 'REQ';
        WHEN 'problem' THEN prefix := 'PRB';
        WHEN 'change' THEN prefix := 'CHG';
        ELSE prefix := 'TKT';
    END CASE;
    
    -- Get next counter value
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(ticket_number FROM (LENGTH(prefix) + 2)) AS INTEGER)
    ), 0) + 1 INTO counter
    FROM tickets
    WHERE tenant_id = NEW.tenant_id AND type = NEW.type;
    
    -- Format number: INC-2026-00001
    number := LPAD(counter::TEXT, 5, '0');
    NEW.ticket_number := prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_number();
```

### Similar functions for problems and changes

```sql
-- Problem number generator
CREATE OR REPLACE FUNCTION generate_problem_number()
RETURNS TRIGGER AS $$
DECLARE
    counter INTEGER;
    number TEXT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(problem_number FROM 5) AS INTEGER)
    ), 0) + 1 INTO counter
    FROM problems
    WHERE tenant_id = NEW.tenant_id;
    
    number := 'PRB-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::TEXT, 5, '0');
    NEW.problem_number := number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_problem_number
BEFORE INSERT ON problems
FOR EACH ROW
EXECUTE FUNCTION generate_problem_number();

-- Change number generator
CREATE OR REPLACE FUNCTION generate_change_number()
RETURNS TRIGGER AS $$
DECLARE
    counter INTEGER;
    number TEXT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(change_number FROM 5) AS INTEGER)
    ), 0) + 1 INTO counter
    FROM changes
    WHERE tenant_id = NEW.tenant_id;
    
    number := 'CHG-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::TEXT, 5, '0');
    NEW.change_number := number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_change_number
BEFORE INSERT ON changes
FOR EACH ROW
EXECUTE FUNCTION generate_change_number();
```

### Updated_at trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_changes_updated_at BEFORE UPDATE ON changes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slas_updated_at BEFORE UPDATE ON slas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Ticket History Auto-Logging

```sql
CREATE OR REPLACE FUNCTION log_ticket_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO ticket_history (ticket_id, action, actor_id)
        VALUES (NEW.id, 'created', NEW.reporter_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Status change
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO ticket_history (ticket_id, action, field_changed, old_value, new_value)
            VALUES (NEW.id, 'status_changed', 'status', to_jsonb(OLD.status), to_jsonb(NEW.status));
        END IF;
        
        -- Assignment change
        IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
            INSERT INTO ticket_history (ticket_id, action, field_changed, old_value, new_value, actor_id)
            VALUES (NEW.id, 'assigned', 'assignee_id', to_jsonb(OLD.assignee_id), to_jsonb(NEW.assignee_id), NEW.reporter_id);
        END IF;
        
        -- Priority change
        IF OLD.priority IS DISTINCT FROM NEW.priority THEN
            INSERT INTO ticket_history (ticket_id, action, field_changed, old_value, new_value)
            VALUES (NEW.id, 'updated', 'priority', to_jsonb(OLD.priority), to_jsonb(NEW.priority));
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_history_trigger
AFTER INSERT OR UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION log_ticket_history();
```
