import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import axios from 'axios';
import { WebhookJob } from '../queue.service';
import * as crypto from 'crypto';

@Processor('webhooks')
export class WebhooksProcessor {
  private readonly logger = new Logger(WebhooksProcessor.name);

  @Process('send-webhook')
  async handleWebhook(job: Job<WebhookJob>): Promise<void> {
    const { url, event, payload, secret, tenantId, integrationId } = job.data;

    this.logger.log(`Sending webhook to ${url} for event ${event}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-ITSM-Event': event,
        'X-ITSM-Tenant': tenantId,
        'X-ITSM-Timestamp': Date.now().toString(),
      };

      // Add signature if secret provided
      if (secret) {
        const timestamp = Date.now().toString();
        const body = JSON.stringify(payload);
        const signedPayload = `${timestamp}.${body}`;
        const signature = crypto
          .createHmac('sha256', secret)
          .update(signedPayload)
          .digest('hex');

        headers['X-ITSM-Signature'] = `t=${timestamp},v1=${signature}`;
      }

      const response = await axios.post(url, payload, {
        headers,
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      this.logger.log(`Webhook delivered successfully: ${response.status}`);
    } catch (error) {
      this.logger.error(
        `Webhook delivery failed: ${error.message}`,
        error.stack,
      );

      if (job.attemptsMade >= job.opts.attempts!) {
        this.logger.error(
          `Webhook failed after ${job.attemptsMade} attempts, marking as failed`,
        );
      }

      throw error;
    }
  }
}
