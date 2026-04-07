import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface CreateChangeDto {
  type: 'standard' | 'normal' | 'emergency';
  title: string;
  description: string;
  justification: string;
  implementationPlan: string;
  rollbackPlan: string;
  testPlan?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  assigneeId?: string;
  affectedServices?: string[];
  requiresCab?: boolean;
}

@Injectable()
export class ChangeService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Create change request
   */
  async create(tenantId: string, requesterId: string, dto: CreateChangeDto): Promise<any> {
    // Determine initial status based on type
    let initialStatus = 'draft';
    if (dto.type === 'standard') {
      initialStatus = 'submitted';
    }

    // Auto-set CAB requirement for normal changes
    const requiresCab = dto.requiresCab ?? dto.type === 'normal';

    const { data: change, error } = await this.supabase
      .from('changes')
      .insert({
        tenant_id: tenantId,
        type: dto.type,
        status: initialStatus,
        title: dto.title,
        description: dto.description,
        justification: dto.justification,
        implementation_plan: dto.implementationPlan,
        rollback_plan: dto.rollbackPlan,
        test_plan: dto.testPlan,
        planned_start_at: dto.plannedStartAt,
        planned_end_at: dto.plannedEndAt,
        assignee_id: dto.assigneeId,
        requester_id: requesterId,
        requires_cab: requiresCab,
        affected_services: dto.affectedServices || [],
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create change request');
    }

    return change;
  }

  /**
   * Get change by ID
   */
  async findById(tenantId: string, changeId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('changes')
      .select(`
        *,
        assignee:assignee_id (id, email, full_name),
        requester:requester_id (id, email, full_name),
        cab_decisions:cab_decisions (
          id,
          vote,
          comments,
          voted_at,
          member:cab_members (
            user_id,
            users:users (id, email, full_name)
          )
        )
      `)
      .eq('id', changeId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Change request not found');
    }

    return data;
  }

  /**
   * Get all changes
   */
  async findAll(tenantId: string, filters?: { type?: string; status?: string }): Promise<any[]> {
    let query = this.supabase
      .from('changes')
      .select(`
        *,
        assignee:assignee_id (id, email, full_name)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('planned_start_at', { ascending: false, nullsFirst: false });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Update change
   */
  async update(tenantId: string, changeId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('changes')
      .update({
        title: updates.title,
        description: updates.description,
        justification: updates.justification,
        implementation_plan: updates.implementationPlan,
        rollback_plan: updates.rollbackPlan,
        test_plan: updates.testPlan,
        planned_start_at: updates.plannedStartAt,
        planned_end_at: updates.plannedEndAt,
        status: updates.status,
        assignee_id: updates.assigneeId,
        risk: updates.risk,
      })
      .eq('id', changeId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Change request not found');
    }

    return data;
  }

  /**
   * Submit change for approval
   */
  async submit(tenantId: string, changeId: string): Promise<any> {
    return this.update(tenantId, changeId, { status: 'submitted' });
  }

  /**
   * Schedule CAB meeting
   */
  async scheduleCab(tenantId: string, changeId: string, meetingDate: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('changes')
      .update({
        status: 'assessing',
        cab_meeting_date: meetingDate,
      })
      .eq('id', changeId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Change request not found');
    }

    return data;
  }

  /**
   * Record CAB decision
   */
  async recordCabDecision(
    tenantId: string,
    changeId: string,
    memberId: string,
    vote: 'approve' | 'reject' | 'abstain',
    comments?: string,
  ): Promise<void> {
    const { error } = await this.supabase.from('cab_decisions').insert({
      change_id: changeId,
      member_id: memberId,
      vote,
      comments,
    });

    if (error) {
      throw new BadRequestException('Failed to record CAB decision');
    }

    // Check if all CAB members have voted
    await this.checkCabComplete(tenantId, changeId);
  }

  /**
   * Check if CAB vote is complete
   */
  private async checkCabComplete(tenantId: string, changeId: string): Promise<void> {
    const change = await this.findById(tenantId, changeId);

    if (!change.requires_cab) return;

    // Get CAB members
    const { data: cabMembers } = await this.supabase
      .from('cab_members')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (!cabMembers || cabMembers.length === 0) return;

    // Get decisions
    const { data: decisions } = await this.supabase
      .from('cab_decisions')
      .select('id')
      .eq('change_id', changeId);

    // If all CAB members voted
    if (decisions && decisions.length >= cabMembers.length) {
      const hasRejection = decisions.some((d: any) => d.vote === 'reject');

      await this.supabase
        .from('changes')
        .update({
          status: hasRejection ? 'draft' : 'authorized',
          cab_approved: !hasRejection,
        })
        .eq('id', changeId);
    }
  }

  /**
   * Implement change
   */
  async implement(tenantId: string, changeId: string, actualStartAt: string): Promise<any> {
    return this.update(tenantId, changeId, {
      status: 'implementing',
      actualStartAt: actualStartAt,
    });
  }

  /**
   * Complete change
   */
  async complete(tenantId: string, changeId: string, actualEndAt: string): Promise<any> {
    return this.update(tenantId, changeId, {
      status: 'reviewing',
      actualEndAt,
    });
  }

  /**
   * Get CAB members
   */
  async getCabMembers(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('cab_members')
      .select(`
        id,
        is_active,
        added_at,
        user:users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Add CAB member
   */
  async addCabMember(tenantId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from('cab_members').insert({
      tenant_id: tenantId,
      user_id: userId,
    });

    if (error) {
      throw new BadRequestException('Failed to add CAB member');
    }
  }

  /**
   * Remove CAB member
   */
  async removeCabMember(tenantId: string, userId: string): Promise<void> {
    await this.supabase
      .from('cab_members')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);
  }

  /**
   * Get change calendar (changes by date)
   */
  async getCalendar(tenantId: string, startDate: string, endDate: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('changes')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('planned_start_at', startDate)
      .lte('planned_start_at', endDate)
      .in('status', ['scheduled', 'implementing', 'reviewing']);

    if (error) {
      return [];
    }

    return data;
  }
}
