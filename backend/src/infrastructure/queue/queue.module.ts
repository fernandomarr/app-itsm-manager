import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { NotificationsProcessor } from './processors/notifications.processor';
import { WebhooksProcessor } from './processors/webhooks.processor';
import { SlaProcessor } from './processors/sla.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'notifications',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 100,
          removeOnFail: 1000,
        },
      },
      {
        name: 'webhooks',
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 50,
          removeOnFail: 500,
        },
      },
      {
        name: 'sla',
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      },
    ),
  ],
  providers: [QueueService, NotificationsProcessor, WebhooksProcessor, SlaProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
