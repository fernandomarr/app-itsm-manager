import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { QueueService } from '../../infrastructure/queue/queue.service';

export interface CreateTemplateDto {
  name: string;
  triggerType: string;
  channels: ('email' | 'slack' | 'teams')[];
  subjectTemplate?: string;
  bodyTemplate: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private queueService: QueueService,
    private logger: Logger,
  ) {}

  /**
   * Create notification template
   */
  async createTemplate(tenantId: string, dto: CreateTemplateDto): Promise<any> {
    const { data, error } = await this.supabase
      .from('notification_templates')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        trigger_type: dto.triggerType,
        channels: dto.channels,
        subject_template: dto.subjectTemplate,
        body_template: dto.bodyTemplate,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create notification template');
    }

    return data;
  }

  /**
   * Get all templates for tenant
   */
  async getTemplates(tenantId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notification_templates')
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
   * Send notification
   */
  async send(
    tenantId: string,
    userId: string,
    type: string,
    subject: string,
    content: string,
    channel: 'email' | 'slack' | 'teams' = 'email',
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.queueService.addNotification({
      userId,
      type,
      subject,
      content,
      channel,
      metadata,
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(tenantId: string, userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', notificationId);
  }
}
