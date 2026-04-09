// Core Types for ITSM Platform

export type TicketType = 'incident' | 'request' | 'problem' | 'change';
export type TicketStatus = 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketImpact = 'low' | 'medium' | 'high';
export type TicketUrgency = 'low' | 'medium' | 'high';

export type TenantRole = 'viewer' | 'member' | 'admin' | 'owner';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'deleted';
  settings: Record<string, any>;
  userRole?: TenantRole;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  impact: TicketImpact;
  urgency: TicketUrgency;
  title: string;
  description: string;
  resolutionNotes?: string;
  assignee?: User;
  reporter: User;
  category?: string;
  subcategory?: string;
  slaDueAt?: string;
  slaBreached: boolean;
  openedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  customFields: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: User;
  content: string;
  visibility: 'public' | 'internal';
  isAutomated: boolean;
  attachments?: any[];
  createdAt: string;
}

export interface Problem {
  id: string;
  problemNumber: string;
  tenantId: string;
  status: 'new' | 'investigating' | 'known_error' | 'resolved' | 'closed';
  title: string;
  description: string;
  rootCause?: string;
  resolution?: string;
  assignee?: User;
  reporter: User;
  priority: TicketPriority;
  category?: string;
  subcategory?: string;
  openedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChangeType = 'standard' | 'normal' | 'emergency';
export type ChangeStatus = 'draft' | 'submitted' | 'assessing' | 'authorized' | 'scheduled' | 'implementing' | 'reviewing' | 'completed' | 'cancelled';
export type ChangeRisk = 'low' | 'medium' | 'high';

export interface Change {
  id: string;
  changeNumber: string;
  tenantId: string;
  type: ChangeType;
  status: ChangeStatus;
  risk: ChangeRisk;
  title: string;
  description: string;
  justification: string;
  implementationPlan: string;
  rollbackPlan: string;
  testPlan?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  assignee?: User;
  requester: User;
  requiresCab: boolean;
  cabApproved?: boolean;
  cabMeetingDate?: string;
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnownError {
  id: string;
  problemId?: string;
  tenantId: string;
  title: string;
  description: string;
  workaround?: string;
  resolution?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sla {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  applyToType: TicketType[];
  applyToPriority: TicketPriority[];
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  schedule: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  entityType: TicketType;
  isActive: boolean;
  isDefault: boolean;
  definition: {
    initialStatus: TicketStatus;
    states: TicketStatus[];
    transitions: WorkflowTransition[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  from: TicketStatus[];
  to: TicketStatus;
  name: string;
  conditions?: Record<string, any>;
  actions?: string[];
  requiresApproval?: boolean;
  approverRole?: string;
}

export interface Integration {
  id: string;
  tenantId: string;
  name: string;
  type: 'webhook' | 'rest_api' | 'oauth' | 'custom';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  webhookSecret?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  imageUrl?: string;
  formSchema: any[];
  workflowId?: string;
  slaId?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  channel: 'email' | 'slack' | 'teams';
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  metadata?: Record<string, any>;
  sentAt?: string;
  createdAt: string;
}

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TicketFilters {
  type?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  page?: number;
  limit?: number;
  search?: string;
}

