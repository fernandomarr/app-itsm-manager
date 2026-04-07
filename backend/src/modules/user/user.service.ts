import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  /**
   * Get multiple users by IDs
   */
  async findByIds(userIds: string[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (error) {
      this.logger.error('Failed to get users', { error });
      return [];
    }

    return data;
  }

  /**
   * Update user profile
   */
  async update(userId: string, dto: UpdateUserDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        full_name: dto.fullName,
        avatar_url: dto.avatarUrl,
        is_active: dto.isActive,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  /**
   * Search users in tenant
   */
  async searchInTenant(tenantId: string, query: string, limit = 20): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select(`
        user_id,
        role,
        users:users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('tenant_id', tenantId)
      .ilike('users.full_name', `%${query}%`)
      .limit(limit);

    if (error) {
      this.logger.error('Failed to search users', { error });
      return [];
    }

    return data.map((m: any) => ({
      id: m.users.id,
      email: m.users.email,
      fullName: m.users.full_name,
      avatarUrl: m.users.avatar_url,
      role: m.role,
    }));
  }

  /**
   * Get users by tenant and role
   */
  async getByRole(tenantId: string, role: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select(`
        user_id,
        users:users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('role', role);

    if (error) {
      this.logger.error('Failed to get users by role', { error });
      return [];
    }

    return data.map((m: any) => ({
      id: m.users.id,
      email: m.users.email,
      fullName: m.users.full_name,
      avatarUrl: m.users.avatar_url,
    }));
  }
}
