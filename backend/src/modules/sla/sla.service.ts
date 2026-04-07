import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { TicketType, TicketPriority } from '../../common/types/roles.types';

export interface CreateSlaDto {
  name: string;
  description?: string;
  applyToType?: TicketType[];
  applyToPriority?: TicketPriority[];
  applyToCategory?: string[];
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  schedule?: any;
}

@Injectable()
export class SlaService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Create SLA policy
   */
  async create(tenantId: string, dto: CreateSlaDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('slas')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        description: dto.description,
        apply_to_type: dto.applyToType,
        apply_to_priority: dto.applyToPriority,
        apply_to_category: dto.applyToCategory,
        response_time_hours: dto.responseTimeHours,
        resolution_time_hours: dto.resolutionTimeHours,
        schedule: dto.schedule || { type: '24x7' },
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create SLA');
    }

    return data;
  }

  /**
   * Get all SLAs for tenant
   */
  async findAll(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('slas')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Get SLA by ID
   */
  async findById(tenantId: string, slaId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('slas')
      .select('*')
      .eq('id', slaId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('SLA not found');
    }

    return data;
  }

  /**
   * Find matching SLA for ticket
   */
  async findMatching(tenantId: string, type: TicketType, priority: TicketPriority, category?: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('slas')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .filter('apply_to_type', 'cs', JSON.stringify([type]))
      .or(`apply_to_priority.is.null,apply_to_priority.cs.${JSON.stringify([priority])}`)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Calculate SLA due date
   */
  calculateDueDate(sla: any, openedAt: Date): { responseDue?: Date; resolutionDue?: Date } {
    const result: { responseDue?: Date; resolutionDue?: Date } = {};

    if (sla.response_time_hours) {
      result.responseDue = new Date(openedAt.getTime() + sla.response_time_hours * 60 * 60 * 1000);
    }

    if (sla.resolution_time_hours) {
      result.resolutionDue = new Date(openedAt.getTime() + sla.resolution_time_hours * 60 * 60 * 1000);
    }

    return result;
  }

  /**
   * Check if SLA is breached
   */
  isBreached(dueDate: Date, currentStatus: string): boolean {
    if (['resolved', 'closed'].includes(currentStatus)) {
      return false;
    }
    return new Date() > dueDate;
  }

  /**
   * Update SLA
   */
  async update(tenantId: string, slaId: string, dto: Partial<CreateSlaDto>): Promise<any> {
    const { data, error } = await this.supabase
      .from('slas')
      .update({
        name: dto.name,
        description: dto.description,
        apply_to_type: dto.applyToType,
        apply_to_priority: dto.applyToPriority,
        response_time_hours: dto.responseTimeHours,
        resolution_time_hours: dto.resolutionTimeHours,
      })
      .eq('id', slaId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('SLA not found');
    }

    return data;
  }

  /**
   * Delete SLA (soft delete)
   */
  async delete(tenantId: string, slaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('slas')
      .update({ is_active: false })
      .eq('id', slaId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new NotFoundException('SLA not found');
    }
  }
}
