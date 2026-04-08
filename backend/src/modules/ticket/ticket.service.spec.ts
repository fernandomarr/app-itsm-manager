import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { WorkflowService } from '../workflow/workflow.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { Logger } from 'winston';

describe('TicketService', () => {
  let service: TicketService;

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const mockWorkflowService = {
    getDefault: jest.fn(),
    canTransition: jest.fn(),
    requiresApproval: jest.fn(),
  };

  const mockQueueService = {
    addSlaCheck: jest.fn(),
    addNotification: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabase },
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: QueueService, useValue: mockQueueService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePriority', () => {
    it('should return critical for high impact + high urgency', () => {
      const result = (service as any).calculatePriority('high', 'high');
      expect(result).toBe('critical');
    });

    it('should return high for high impact + medium urgency', () => {
      const result = (service as any).calculatePriority('high', 'medium');
      expect(result).toBe('high');
    });

    it('should return medium for low impact + low urgency', () => {
      const result = (service as any).calculatePriority('low', 'low');
      expect(result).toBe('low');
    });
  });
});
