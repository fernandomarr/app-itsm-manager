import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface CreateServiceDto {
  categoryId?: string;
  name: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  imageUrl?: string;
  formSchema?: any[];
  workflowId?: string;
  slaId?: string;
  isFeatured?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
}

@Injectable()
export class ServiceCatalogService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  /**
   * Get all services for tenant
   */
  async findAll(tenantId: string, options?: { activeOnly?: boolean }): Promise<any[]> {
    let query = this.supabase
      .from('services')
      .select(`
        *,
        category:service_categories (
          id,
          name,
          icon
        ),
        workflow:workflow_id (id, name),
        sla:sla_id (id, name)
      `)
      .eq('tenant_id', tenantId);

    if (options?.activeOnly !== false) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Get service by ID
   */
  async findById(tenantId: string, serviceId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .select(`
        *,
        category:service_categories (id, name, icon),
        workflow:workflow_id (id, name, definition),
        sla:sla_id (id, name, response_time_hours, resolution_time_hours)
      `)
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Service not found');
    }

    return data;
  }

  /**
   * Create service
   */
  async create(tenantId: string, dto: CreateServiceDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .insert({
        tenant_id: tenantId,
        category_id: dto.categoryId,
        name: dto.name,
        description: dto.description,
        short_description: dto.shortDescription,
        icon: dto.icon,
        image_url: dto.imageUrl,
        form_schema: dto.formSchema || [],
        workflow_id: dto.workflowId,
        sla_id: dto.slaId,
        is_featured: dto.isFeatured || false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create service');
    }

    return data;
  }

  /**
   * Update service
   */
  async update(tenantId: string, serviceId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .update({
        name: updates.name,
        description: updates.description,
        short_description: updates.shortDescription,
        icon: updates.icon,
        image_url: updates.imageUrl,
        form_schema: updates.formSchema,
        workflow_id: updates.workflowId,
        sla_id: updates.slaId,
        is_featured: updates.isFeatured,
        is_active: updates.isActive,
        sort_order: updates.sortOrder,
      })
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Service not found');
    }

    return data;
  }

  /**
   * Delete service (soft delete)
   */
  async delete(tenantId: string, serviceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new NotFoundException('Service not found');
    }
  }

  /**
   * Get all categories
   */
  async getCategories(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('service_categories')
      .select(`
        *,
        parent:parent_id (id, name)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Create category
   */
  async createCategory(tenantId: string, dto: CreateCategoryDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('service_categories')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        description: dto.description,
        parent_id: dto.parentId,
        icon: dto.icon,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create category');
    }

    return data;
  }

  /**
   * Update category
   */
  async updateCategory(tenantId: string, categoryId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('service_categories')
      .update({
        name: updates.name,
        description: updates.description,
        icon: updates.icon,
        sort_order: updates.sortOrder,
        is_active: updates.isActive,
      })
      .eq('id', categoryId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  /**
   * Get featured services
   */
  async getFeatured(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Search services
   */
  async search(tenantId: string, query: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`);

    if (error) {
      return [];
    }

    return data;
  }
}
