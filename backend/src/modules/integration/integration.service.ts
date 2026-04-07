import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { QueueService } from '../../infrastructure/queue/queue.service';
import * as crypto from 'crypto';

export interface CreateIntegrationDto {
  name: string;
  type: 'webhook' | 'rest_api' | 'oauth' | 'custom';
  config: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface TriggerWebhookDto {
  integrationId: string;
  eventType: string;
  payload: Record<string, any>;
}

@Injectable()
export class IntegrationService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private queueService: QueueService,
    private logger: Logger,
  ) {}

  /**
   * Create integration
   */
  async create(tenantId: string, dto: CreateIntegrationDto): Promise<any> {
    const webhookSecret = dto.type === 'webhook'
      ? crypto.randomBytes(32).toString('hex')
      : undefined;

    const { data, error } = await this.supabase
      .from('integrations')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        type: dto.type,
        config: dto.config,
        credentials: dto.credentials,
        webhook_secret: webhookSecret,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create integration');
    }

    return data;
  }

  /**
   * Get all integrations
   */
  async findAll(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Get integration by ID
   */
  async findById(tenantId: string, integrationId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Integration not found');
    }

    return data;
  }

  /**
   * Update integration
   */
  async update(tenantId: string, integrationId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('integrations')
      .update({
        name: updates.name,
        config: updates.config,
        status: updates.status,
      })
      .eq('id', integrationId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Integration not found');
    }

    return data;
  }

  /**
   * Delete integration
   */
  async delete(tenantId: string, integrationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('integrations')
      .update({ status: 'inactive' })
      .eq('id', integrationId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new NotFoundException('Integration not found');
    }
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhook(tenantId: string, dto: TriggerWebhookDto): Promise<void> {
    const integration = await this.findById(tenantId, dto.integrationId);

    if (integration.type !== 'webhook' || integration.status !== 'active') {
      throw new BadRequestException('Invalid or inactive webhook integration');
    }

    const url = integration.config.url;
    if (!url) {
      throw new BadRequestException('Webhook URL not configured');
    }

    // Queue webhook delivery
    await this.queueService.addWebhook({
      tenantId,
      integrationId: dto.integrationId,
      url,
      event: dto.eventType,
      payload: dto.payload,
      secret: integration.webhook_secret,
    });

    this.logger.info('Webhook queued', {
      integrationId: dto.integrationId,
      event: dto.eventType,
    });
  }

  /**
   * Trigger webhook for all active webhook integrations
   */
  async broadcastWebhook(
    tenantId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const integrations = await this.supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('type', 'webhook')
      .eq('status', 'active');

    for (const integration of integrations.data || []) {
      await this.triggerWebhook(tenantId, {
        integrationId: integration.id,
        eventType,
        payload,
      });
    }
  }

  /**
   * Get integration logs
   */
  async getLogs(tenantId: string, integrationId: string, limit = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('integration_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Log integration activity
   */
  async log(
    integrationId: string,
    level: 'info' | 'warning' | 'error' | 'debug',
    action: string,
    request?: any,
    response?: any,
    errorMessage?: string,
  ): Promise<void> {
    await this.supabase.from('integration_logs').insert({
      integration_id: integrationId,
      level,
      action,
      request: request ? JSON.stringify(request) : null,
      response: response ? JSON.stringify(response) : null,
      error_message: errorMessage,
    });
  }

  /**
   * Test connection
   */
  async testConnection(tenantId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findById(tenantId, integrationId);

    // Basic test based on type
    switch (integration.type) {
      case 'webhook':
        if (!integration.config.url) {
          return { success: false, message: 'URL not configured' };
        }
        return { success: true, message: 'Webhook URL is configured' };

      case 'rest_api':
        if (!integration.config.baseUrl) {
          return { success: false, message: 'Base URL not configured' };
        }
        return { success: true, message: 'API base URL is configured' };

      case 'oauth':
        if (!integration.credentials?.access_token) {
          return { success: false, message: 'OAuth token not configured' };
        }
        return { success: true, message: 'OAuth token is configured' };

      default:
        return { success: true, message: 'Integration configured' };
    }
  }
}
