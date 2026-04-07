import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface NotificationJob {
  userId: string;
  type: string;
  subject: string;
  content: string;
  channel: 'email' | 'slack' | 'teams';
  metadata?: Record<string, any>;
}

export interface WebhookJob {
  tenantId: string;
  integrationId: string;
  url: string;
  event: string;
  payload: Record<string, any>;
  secret?: string;
}

export interface SlaJob {
  ticketId: string;
  tenantId: string;
  type: 'check' | 'breach_warning' | 'breach';
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('webhooks') private webhooksQueue: Queue,
    @InjectQueue('sla') private slaQueue: Queue,
  ) {}

  /**
   * Add notification to queue
   */
  async addNotification(job: NotificationJob): Promise<void> {
    await this.notificationsQueue.add('send-notification', job);
  }

  /**
   * Add webhook to queue
   */
  async addWebhook(job: WebhookJob, delay?: number): Promise<void> {
    await this.webhooksQueue.add('send-webhook', job, {
      delay,
      jobId: `${job.tenantId}:${job.integrationId}:${Date.now()}`,
    });
  }

  /**
   * Add SLA check to queue
   */
  async addSlaCheck(job: SlaJob, delay?: number): Promise<void> {
    await this.slaQueue.add('check-sla', job, { delay });
  }

  /**
   * Schedule SLA breach warning
   */
  async scheduleSlaWarning(ticketId: string, tenantId: string, delayMs: number): Promise<void> {
    await this.slaQueue.add(
      'sla-breach-warning',
      { ticketId, tenantId, type: 'breach_warning' },
      { delay: delayMs, jobId: `sla-warning:${ticketId}` },
    );
  }

  /**
   * Cancel scheduled job
   */
  async cancelJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  private getQueue(queueName: string): Queue {
    switch (queueName) {
      case 'notifications':
        return this.notificationsQueue;
      case 'webhooks':
        return this.webhooksQueue;
      case 'sla':
        return this.slaQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}
