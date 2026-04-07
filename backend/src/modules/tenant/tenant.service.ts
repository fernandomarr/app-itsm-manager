import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface CreateTenantDto {
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantDto {
  name?: string;
  settings?: Record<string, any>;
}

export interface TenantMember {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

@Injectable()
export class TenantService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Create a new tenant
   */
  async create(dto: CreateTenantDto, ownerId: string): Promise<any> {
    // Check if slug is available
    const { data: existing } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('slug', dto.slug)
      .single();

    if (existing) {
      throw new ConflictException('Tenant slug already taken');
    }

    // Create tenant
    const { data: tenant, error } = await this.supabase
      .from('tenants')
      .insert({
        name: dto.name,
        slug: dto.slug,
        settings: dto.settings || {},
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create tenant', { error });
      throw new BadRequestException('Failed to create tenant');
    }

    // Add owner as tenant_users entry
    await this.supabase.from('tenant_users').insert({
      tenant_id: tenant.id,
      user_id: ownerId,
      role: 'owner',
    });

    this.logger.info('Tenant created', { tenantId: tenant.id, ownerId });
    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async findById(tenantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Tenant not found');
    }

    return data;
  }

  /**
   * Get tenant by slug
   */
  async findBySlug(slug: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundException('Tenant not found');
    }

    return data;
  }

  /**
   * Update tenant
   */
  async update(tenantId: string, dto: UpdateTenantDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        name: dto.name,
        settings: dto.settings,
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Tenant not found');
    }

    return data;
  }

  /**
   * Delete tenant (soft delete)
   */
  async delete(tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenants')
      .update({ status: 'deleted' })
      .eq('id', tenantId);

    if (error) {
      throw new NotFoundException('Tenant not found');
    }

    this.logger.info('Tenant deleted', { tenantId });
  }

  /**
   * Get all members of a tenant
   */
  async getMembers(tenantId: string): Promise<TenantMember[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        users:users (
          id,
          email,
          full_name
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) {
      this.logger.error('Failed to get tenant members', { error });
      throw new BadRequestException('Failed to get members');
    }

    return data.map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      email: m.users.email,
      fullName: m.users.full_name,
      role: m.role,
      joinedAt: m.joined_at,
    }));
  }

  /**
   * Add member to tenant
   */
  async addMember(
    tenantId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
  ): Promise<void> {
    const { error } = await this.supabase.from('tenant_users').insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
    });

    if (error) {
      throw new ConflictException('Failed to add member');
    }

    this.logger.info('Member added to tenant', { tenantId, userId, role });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    tenantId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
  ): Promise<void> {
    const { error } = await this.supabase
      .from('tenant_users')
      .update({ role })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException('Failed to update member role');
    }
  }

  /**
   * Remove member from tenant
   */
  async removeMember(tenantId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenant_users')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException('Failed to remove member');
    }
  }

  /**
   * Get user's tenants
   */
  async getUserTenants(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select(`
        id,
        role,
        tenants:tenants (
          id,
          name,
          slug,
          status,
          settings
        )
      `)
      .eq('user_id', userId);

    if (error) {
      return [];
    }

    return data.map((m: any) => ({
      ...m.tenants,
      userRole: m.role,
    }));
  }
}
