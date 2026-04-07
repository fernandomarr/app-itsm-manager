import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { IncidentController } from './incident.controller';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [TicketModule],
  controllers: [IncidentController],
  providers: [IncidentService],
  exports: [IncidentService],
})
export class IncidentModule {}
