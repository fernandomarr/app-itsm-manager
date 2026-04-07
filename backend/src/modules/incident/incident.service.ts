import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { TicketService } from '../ticket/ticket.service';

export interface CreateIncidentDto {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  impact?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  categoryId?: string;
  subcategoryId?: string;
  assigneeId?: string;
  affectedServices?: string[];
  customFields?: Record<string, any>;
}

@Injectable()
export class IncidentService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private ticketService: TicketService,
    private logger: Logger,
  ) {}

  /**
   * Create incident (specialized ticket)
   */
  async create(tenantId: string, reporterId: string, dto: CreateIncidentDto): Promise<any> {
    return this.ticketService.create(tenantId, reporterId, {
      type: 'incident',
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      impact: dto.impact,
      urgency: dto.urgency,
      categoryId: dto.categoryId,
      subcategoryId: dto.subcategoryId,
      assigneeId: dto.assigneeId,
      customFields: {
        affectedServices: dto.affectedServices || [],
        ...dto.customFields,
      },
    });
  }

  /**
   * Get incident statistics
   */
  async getStats(tenantId: string): Promise<any> {
    const baseStats = await this.ticketService.getStats(tenantId, 'incident');

    // Get additional incident-specific stats
    const { data } = await this.supabase
      .from('tickets')
      .select('category, subcategory')
      .eq('tenant_id', tenantId)
      .eq('type', 'incident');

    const byCategory = data?.reduce((acc, t) => {
      acc[t.category || 'Uncategorized'] = (acc[t.category || 'Uncategorized'] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      ...baseStats,
      byCategory,
    };
  }

  /**
   * Get incidents by assignment
   */
  async getUnassigned(tenantId: string): Promise<any[]> {
    const result = await this.ticketService.findAll(tenantId, {
      type: 'incident',
      status: ['new', 'in_progress'],
    });
    return result.data.filter((t) => !t.assignee_id);
  }
}
