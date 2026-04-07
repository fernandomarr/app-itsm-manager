import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { NotificationModule } from '../notification/notification.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [WorkflowModule, NotificationModule, QueueModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
