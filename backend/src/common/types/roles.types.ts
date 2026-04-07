export type TenantRole = 'viewer' | 'member' | 'admin' | 'owner';

export type TicketType = 'incident' | 'request' | 'problem' | 'change';

export type TicketStatus = 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketImpact = 'low' | 'medium' | 'high';

export type TicketUrgency = 'low' | 'medium' | 'high';

export type ProblemStatus = 'new' | 'investigating' | 'known_error' | 'resolved' | 'closed';

export type ChangeType = 'standard' | 'normal' | 'emergency';

export type ChangeStatus =
  | 'draft'
  | 'submitted'
  | 'assessing'
  | 'authorized'
  | 'scheduled'
  | 'implementing'
  | 'reviewing'
  | 'completed'
  | 'cancelled';

export type ChangeRisk = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Permission {
  resource: string;
  actions: string[]; // create, read, update, delete, manage
}

export const RolePermissions: Record<TenantRole, Permission[]> = {
  viewer: [
    { resource: 'tickets', actions: ['read'] },
    { resource: 'incidents', actions: ['read'] },
    { resource: 'requests', actions: ['read'] },
    { resource: 'problems', actions: ['read'] },
    { resource: 'changes', actions: ['read'] },
  ],
  member: [
    { resource: 'tickets', actions: ['create', 'read', 'update'] },
    { resource: 'incidents', actions: ['create', 'read', 'update'] },
    { resource: 'requests', actions: ['create', 'read', 'update'] },
    { resource: 'problems', actions: ['read'] },
    { resource: 'changes', actions: ['create', 'read'] },
  ],
  admin: [
    { resource: 'tickets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'incidents', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'requests', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'problems', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'changes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'workflows', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'slas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['read', 'update'] },
  ],
  owner: [
    { resource: '*', actions: ['*'] },
  ],
};
