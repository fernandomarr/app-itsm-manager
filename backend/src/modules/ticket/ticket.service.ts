import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { WorkflowService } from '../workflow/workflow.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { TicketType, TicketStatus, TicketPriority } from '../../common/types/roles.types';

export interface CreateTicketDto {
  type: TicketType;
  title: string;
  description: string;
  priority?: TicketPriority;
  impact?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  categoryId?: string;
  subcategoryId?: string;
  assigneeId?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  impact?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  status?: TicketStatus;
  assigneeId?: string;
  resolutionNotes?: string;
  categoryId?: string;
  subcategoryId?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface TicketFilters {
  type?: TicketType;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assigneeId?: string;
  reporterId?: string;
  categoryId?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class TicketService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private workflowService: WorkflowService,
    private queueService: QueueService,
    private logger: Logger,
  ) {}

  /**
   * Create a new ticket
   */
  async create(tenantId: string, reporterId: string, dto: CreateTicketDto): Promise<any> {
    // Calculate priority if not provided
    const priority = dto.priority || this.calculatePriority(dto.impact, dto.urgency);

    // Get workflow to determine initial status
    const workflow = await this.workflowService.getDefault(tenantId, dto.type);
    const initialStatus = workflow?.definition?.initialStatus || 'new';

    // Insert ticket
    const { data: ticket, error } = await this.supabase
      .from('tickets')
      .insert({
        tenant_id: tenantId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        priority,
        impact: dto.impact || 'medium',
        urgency: dto.urgency || 'medium',
        status: initialStatus,
        reporter_id: reporterId,
        assignee_id: dto.assigneeId,
        category: dto.categoryId,
        subcategory: dto.subcategoryId,
        custom_fields: dto.customFields || {},
        tags: dto.tags || [],
      })
      .select(`
        *,
        reporter:reporter_id (id, email, full_name),
        assignee:assignee_id (id, email, full_name)
      `)
      .single();

    if (error) {
      this.logger.error('Failed to create ticket', { error });
      throw new BadRequestException('Failed to create ticket');
    }

    // Queue SLA check
    await this.queueService.addSlaCheck({
      ticketId: ticket.id,
      tenantId,
      type: 'check',
    });

    // Queue notification to assignee if assigned
    if (dto.assigneeId) {
      await this.queueService.addNotification({
        userId: dto.assigneeId,
        type: 'ticket_assigned',
        subject: `New ticket assigned: ${ticket.ticket_number}`,
        content: `You have been assigned to ticket ${ticket.ticket_number}: ${ticket.title}`,
        channel: 'email',
        metadata: { ticketId: ticket.id, ticketNumber: ticket.ticket_number },
      });
    }

    this.logger.info('Ticket created', { ticketId: ticket.id, type: dto.type });
    return ticket;
  }

  /**
   * Get ticket by ID
   */
  async findById(tenantId: string, ticketId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        reporter:reporter_id (id, email, full_name),
        assignee:assignee_id (id, email, full_name),
        sla:sla_id (id, name, response_time_hours, resolution_time_hours),
        comments:ticket_comments (
          id,
          content,
          visibility,
          is_automated,
          created_at,
          author:author_id (id, email, full_name, avatar_url)
        ),
        relations:ticket_relations (
          id,
          relation_type,
          target:target_ticket_id (
            id,
            ticket_number,
            title,
            status,
            type
          )
        )
      `)
      .eq('id', ticketId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Ticket not found');
    }

    return data;
  }

  /**
   * Get tickets with filters
   */
  async findAll(tenantId: string, filters: TicketFilters): Promise<{ data: any[]; total: number }> {
    let query = this.supabase
      .from('tickets')
      .select(`
        *,
        reporter:reporter_id (id, email, full_name),
        assignee:assignee_id (id, email, full_name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters.assigneeId) {
      query = query.eq('assignee_id', filters.assigneeId);
    }
    if (filters.reporterId) {
      query = query.eq('reporter_id', filters.reporterId);
    }
    if (filters.categoryId) {
      query = query.eq('category', filters.categoryId);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Failed to fetch tickets', { error });
      throw new BadRequestException('Failed to fetch tickets');
    }

    return { data: data || [], total: count || 0 };
  }

  /**
   * Update ticket
   */
  async update(tenantId: string, ticketId: string, dto: UpdateTicketDto, actorId: string): Promise<any> {
    // Get current ticket
    const current = await this.findById(tenantId, ticketId);

    // Check workflow transition if status changed
    if (dto.status && dto.status !== current.status) {
      const canTransition = await this.workflowService.canTransition(
        tenantId,
        current.type,
        current.status,
        dto.status,
      );

      if (!canTransition) {
        throw new BadRequestException(
          `Cannot transition from ${current.status} to ${dto.status}`,
        );
      }
    }

    // Build update object
    const updateData: Record<string, any> = { ...dto };

    // Auto-calculate priority if impact or urgency changed
    if (dto.impact || dto.urgency) {
      updateData.priority = this.calculatePriority(
        dto.impact || current.impact,
        dto.urgency || current.urgency,
      );
    }

    // Set resolved_at when status becomes resolved
    if (dto.status === 'resolved' && current.status !== 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    // Set closed_at when status becomes closed
    if (dto.status === 'closed' && current.status !== 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        reporter:reporter_id (id, email, full_name),
        assignee:assignee_id (id, email, full_name)
      `)
      .single();

    if (error || !data) {
      throw new BadRequestException('Failed to update ticket');
    }

    // Queue notification if assignee changed
    if (dto.assigneeId && dto.assigneeId !== current.assignee_id?.id) {
      await this.queueService.addNotification({
        userId: dto.assigneeId,
        type: 'ticket_assigned',
        subject: `Ticket assigned: ${data.ticket_number}`,
        content: `You have been assigned to ticket ${data.ticket_number}: ${data.title}`,
        channel: 'email',
        metadata: { ticketId: data.id },
      });
    }

    return data;
  }

  /**
   * Transition ticket status
   */
  async transition(
    tenantId: string,
    ticketId: string,
    toStatus: TicketStatus,
    actorId: string,
  ): Promise<any> {
    const ticket = await this.findById(tenantId, ticketId);

    const canTransition = await this.workflowService.canTransition(
      tenantId,
      ticket.type,
      ticket.status,
      toStatus,
    );

    if (!canTransition) {
      throw new BadRequestException(
        `Cannot transition from ${ticket.status} to ${toStatus}`,
      );
    }

    // Check if approval is required
    const requiresApproval = await this.workflowService.requiresApproval(
      tenantId,
      ticket.type,
      ticket.status,
      toStatus,
    );

    if (requiresApproval) {
      // Create approval request
      const approval = await this.workflowService.requestApproval(
        tenantId,
        ticketId,
        ticket.status,
        toStatus,
        actorId,
      );

      return { ...ticket, pendingApproval: approval };
    }

    // Perform transition
    return this.update(tenantId, ticketId, { status: toStatus }, actorId);
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    tenantId: string,
    ticketId: string,
    authorId: string,
    content: string,
    visibility: 'public' | 'internal' = 'public',
    attachments?: any[],
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        author_id: authorId,
        content,
        visibility,
        attachments: attachments || [],
      })
      .select(`
        *,
        author:author_id (id, email, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw new BadRequestException('Failed to add comment');
    }

    // Get ticket for notification
    const ticket = await this.findById(tenantId, ticketId);

    // Notify assignee
    if (ticket.assignee_id && ticket.assignee_id.id !== authorId) {
      await this.queueService.addNotification({
        userId: ticket.assignee_id.id,
        type: 'ticket_updated',
        subject: `New comment on ${ticket.ticket_number}`,
        content: `A new comment was added to ${ticket.ticket_number}`,
        channel: 'email',
        metadata: { ticketId, commentId: data.id },
      });
    }

    return data;
  }

  /**
   * Get ticket comments
   */
  async getComments(tenantId: string, ticketId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ticket_comments')
      .select(`
        *,
        author:author_id (id, email, full_name, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Link tickets
   */
  async linkTickets(
    tenantId: string,
    sourceTicketId: string,
    targetTicketId: string,
    relationType: 'blocks' | 'blocked_by' | 'relates_to' | 'caused_by' | 'duplicate_of',
  ): Promise<void> {
    const { error } = await this.supabase.from('ticket_relations').insert({
      source_ticket_id: sourceTicketId,
      target_ticket_id: targetTicketId,
      relation_type: relationType,
    });

    if (error) {
      throw new BadRequestException('Failed to link tickets');
    }
  }

  /**
   * Calculate priority from impact and urgency
   */
  private calculatePriority(
    impact: 'low' | 'medium' | 'high',
    urgency: 'low' | 'medium' | 'high',
  ): TicketPriority {
    const matrix: Record<string, Record<string, TicketPriority>> = {
      high: { high: 'critical', medium: 'high', low: 'medium' },
      medium: { high: 'high', medium: 'medium', low: 'medium' },
      low: { high: 'medium', medium: 'low', low: 'low' },
    };

    return matrix[impact]?.[urgency] || 'medium';
  }

  /**
   * Get dashboard statistics
   */
  async getStats(tenantId: string, type?: TicketType): Promise<any> {
    let query = this.supabase.from('tickets').select('status, priority', { count: 'exact' }).eq('tenant_id', tenantId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return { total: 0, byStatus: {}, byPriority: {}, overdue: 0 };
    }

    const byStatus = data.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = data.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const overdue = data.filter(
      (t) => t.sla_breached || (t.sla_due_at && new Date(t.sla_due_at) < new Date()),
    ).length;

    return {
      total: data.length,
      byStatus,
      byPriority,
      overdue,
    };
  }
}
