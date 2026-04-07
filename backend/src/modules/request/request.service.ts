import { Injectable } from '@nestjs/common';
import { TicketService } from '../ticket/ticket.service';

export interface CreateRequestDto {
  serviceId?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  categoryId?: string;
  assigneeId?: string;
  customFields?: Record<string, any>;
}

@Injectable()
export class RequestService {
  constructor(private ticketService: TicketService) {}

  /**
   * Create service request
   */
  async create(tenantId: string, reporterId: string, dto: CreateRequestDto): Promise<any> {
    return this.ticketService.create(tenantId, reporterId, {
      type: 'request',
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      categoryId: dto.categoryId,
      assigneeId: dto.assigneeId,
      customFields: {
        serviceId: dto.serviceId,
        ...dto.customFields,
      },
    });
  }

  /**
   * Get request statistics
   */
  async getStats(tenantId: string): Promise<any> {
    return this.ticketService.getStats(tenantId, 'request');
  }
}
