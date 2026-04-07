import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { TicketType, TicketStatus } from '../../common/types/roles.types';

export interface WorkflowDefinition {
  initialStatus: TicketStatus;
  states: TicketStatus[];
  transitions: WorkflowTransition[];
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

@Injectable()
export class WorkflowService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Get default workflow for entity type
   */
  async getDefault(tenantId: string, entityType: TicketType): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      // Return default workflow if none configured
      return this.getDefaultWorkflow(entityType);
    }

    return data;
  }

  /**
   * Check if transition is allowed
   */
  async canTransition(
    tenantId: string,
    entityType: TicketType,
    fromStatus: TicketStatus,
    toStatus: TicketStatus,
  ): Promise<boolean> {
    const workflow = await this.getDefault(tenantId, entityType);
    const definition = workflow.definition as WorkflowDefinition;

    // Find valid transition
    const transition = definition.transitions.find(
      (t) => t.to === toStatus && t.from.includes(fromStatus),
    );

    return !!transition;
  }

  /**
   * Check if transition requires approval
   */
  async requiresApproval(
    tenantId: string,
    entityType: TicketType,
    fromStatus: TicketStatus,
    toStatus: TicketStatus,
  ): Promise<boolean> {
    const workflow = await this.getDefault(tenantId, entityType);
    const definition = workflow.definition as WorkflowDefinition;

    const transition = definition.transitions.find(
      (t) => t.to === toStatus && t.from.includes(fromStatus),
    );

    return transition?.requiresApproval || false;
  }

  /**
   * Request approval for transition
   */
  async requestApproval(
    tenantId: string,
    ticketId: string,
    fromStatus: TicketStatus,
    toStatus: TicketStatus,
    requestedBy: string,
  ): Promise<any> {
    // Get workflow to find approver role
    const workflow = await this.getDefault(tenantId, 'change' as TicketType);
    const definition = workflow.definition as WorkflowDefinition;

    const transition = definition.transitions.find(
      (t) => t.to === toStatus && t.from.includes(fromStatus),
    );

    if (!transition?.requiresApproval) {
      throw new BadRequestException('This transition does not require approval');
    }

    // Create approval request
    const { data, error } = await this.supabase
      .from('approvals')
      .insert({
        ticket_id: ticketId,
        requested_by: requestedBy,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create approval request');
    }

    return data;
  }

  /**
   * Create custom workflow
   */
  async create(
    tenantId: string,
    name: string,
    entityType: TicketType,
    definition: WorkflowDefinition,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflows')
      .insert({
        tenant_id: tenantId,
        name,
        entity_type: entityType,
        definition,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create workflow');
    }

    return data;
  }

  /**
   * Set workflow as default
   */
  async setAsDefault(tenantId: string, workflowId: string): Promise<void> {
    const workflow = await this.findById(tenantId, workflowId);

    // First, unset all defaults for this entity type
    await this.supabase
      .from('workflows')
      .update({ is_default: false })
      .eq('tenant_id', tenantId)
      .eq('entity_type', workflow.entity_type);

    // Then set this as default
    await this.supabase
      .from('workflows')
      .update({ is_default: true })
      .eq('id', workflowId);
  }

  /**
   * Get workflow by ID
   */
  async findById(tenantId: string, workflowId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Workflow not found');
    }

    return data;
  }

  /**
   * Get all workflows for tenant
   */
  async findAll(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Update workflow
   */
  async update(
    tenantId: string,
    workflowId: string,
    updates: { name?: string; definition?: WorkflowDefinition },
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflows')
      .update({
        name: updates.name,
        definition: updates.definition,
      })
      .eq('id', workflowId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Workflow not found');
    }

    return data;
  }

  /**
   * Delete workflow
   */
  async delete(tenantId: string, workflowId: string): Promise<void> {
    const workflow = await this.findById(tenantId, workflowId);

    if (workflow.is_default) {
      throw new BadRequestException('Cannot delete default workflow');
    }

    const { error } = await this.supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new BadRequestException('Failed to delete workflow');
    }
  }

  /**
   * Get default workflow definition for entity type
   */
  private getDefaultWorkflow(entityType: TicketType): any {
    const defaultWorkflows: Record<TicketType, WorkflowDefinition> = {
      incident: {
        initialStatus: 'new',
        states: ['new', 'in_progress', 'pending', 'resolved', 'closed'],
        transitions: [
          { from: ['new'], to: 'in_progress', name: 'Start Work' },
          { from: ['new'], to: 'pending', name: 'Wait for Info' },
          { from: ['in_progress'], to: 'pending', name: 'Wait for Info' },
          { from: ['in_progress'], to: 'resolved', name: 'Resolve' },
          { from: ['pending'], to: 'in_progress', name: 'Resume Work' },
          { from: ['resolved'], to: 'closed', name: 'Close' },
          { from: ['resolved'], to: 'in_progress', name: 'Reopen' },
        ],
      },
      request: {
        initialStatus: 'new',
        states: ['new', 'in_progress', 'pending', 'resolved', 'closed'],
        transitions: [
          { from: ['new'], to: 'in_progress', name: 'Start Work' },
          { from: ['new'], to: 'resolved', name: 'Fulfill', requiresApproval: true },
          { from: ['in_progress'], to: 'pending', name: 'Wait for Info' },
          { from: ['in_progress'], to: 'resolved', name: 'Fulfill' },
          { from: ['pending'], to: 'in_progress', name: 'Resume Work' },
          { from: ['resolved'], to: 'closed', name: 'Close' },
        ],
      },
      problem: {
        initialStatus: 'new',
        states: ['new', 'in_progress', 'pending', 'resolved', 'closed'],
        transitions: [
          { from: ['new'], to: 'in_progress', name: 'Investigate' },
          { from: ['in_progress'], to: 'pending', name: 'Wait for Info' },
          { from: ['in_progress'], to: 'resolved', name: 'Identify Root Cause' },
          { from: ['pending'], to: 'in_progress', name: 'Resume' },
          { from: ['resolved'], to: 'closed', name: 'Close' },
        ],
      },
      change: {
        initialStatus: 'new',
        states: ['new', 'in_progress', 'pending', 'resolved', 'closed'],
        transitions: [
          { from: ['new'], to: 'in_progress', name: 'Assess', requiresApproval: true },
          { from: ['in_progress'], to: 'pending', name: 'Await CAB' },
          { from: ['pending'], to: 'in_progress', name: 'Implement' },
          { from: ['in_progress'], to: 'resolved', name: 'Complete' },
          { from: ['resolved'], to: 'closed', name: 'Review & Close' },
        ],
      },
    };

    return {
      id: 'default',
      name: `Default ${entityType} Workflow`,
      entity_type: entityType,
      definition: defaultWorkflows[entityType],
    };
  }
}
