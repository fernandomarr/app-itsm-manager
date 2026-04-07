import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface CreateProblemDto {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  categoryId?: string;
  subcategoryId?: string;
  assigneeId?: string;
  relatedIncidentIds?: string[];
}

export interface CreateKnownErrorDto {
  problemId?: string;
  title: string;
  description: string;
  workaround?: string;
  resolution?: string;
  keywords?: string[];
}

@Injectable()
export class ProblemService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Create problem
   */
  async create(tenantId: string, reporterId: string, dto: CreateProblemDto): Promise<any> {
    const { data: problem, error } = await this.supabase
      .from('problems')
      .insert({
        tenant_id: tenantId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'medium',
        category: dto.categoryId,
        subcategory: dto.subcategoryId,
        assignee_id: dto.assigneeId,
        reporter_id: reporterId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create problem');
    }

    // Link related incidents
    if (dto.relatedIncidentIds && dto.relatedIncidentIds.length > 0) {
      const relations = dto.relatedIncidentIds.map((incidentId) => ({
        source_ticket_id: incidentId,
        target_ticket_id: problem.id,
        relation_type: 'caused_by' as const,
      }));

      await this.supabase.from('ticket_relations').insert(relations);
    }

    return problem;
  }

  /**
   * Get problem by ID
   */
  async findById(tenantId: string, problemId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('problems')
      .select(`
        *,
        assignee:assignee_id (id, email, full_name),
        reporter:reporter_id (id, email, full_name),
        related_incidents:ticket_relations (
          source:source_ticket_id (
            id,
            ticket_number,
            title,
            status
          )
        )
      `)
      .eq('id', problemId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Problem not found');
    }

    return data;
  }

  /**
   * Get all problems
   */
  async findAll(tenantId: string, filters?: { status?: string[] }): Promise<any[]> {
    let query = this.supabase
      .from('problems')
      .select(`
        *,
        assignee:assignee_id (id, email, full_name)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.in('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Update problem
   */
  async update(tenantId: string, problemId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('problems')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        status: updates.status,
        root_cause: updates.rootCause,
        resolution: updates.resolution,
        assignee_id: updates.assigneeId,
      })
      .eq('id', problemId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Problem not found');
    }

    return data;
  }

  /**
   * Create known error
   */
  async createKnownError(tenantId: string, dto: CreateKnownErrorDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('known_errors')
      .insert({
        tenant_id: tenantId,
        problem_id: dto.problemId,
        title: dto.title,
        description: dto.description,
        workaround: dto.workaround,
        resolution: dto.resolution,
        keywords: dto.keywords || [],
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create known error');
    }

    return data;
  }

  /**
   * Search known errors
   */
  async searchKnownErrors(tenantId: string, query: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('known_errors')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,keywords.cs.{${query}}`);

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Get all known errors
   */
  async getKnownErrors(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('known_errors')
      .select(`
        *,
        problem:problem_id (id, problem_number, title)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }
}
