import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TicketType, TicketStatus, TicketPriority } from '../../common/types/roles.types';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('tickets')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.ticketService.create(req.tenantId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets with filters' })
  async findAll(
    @Request() req: any,
    @Query('type') type?: TicketType,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assigneeId?: string,
    @Query('reporter') reporterId?: string,
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters = {
      type,
      status: status ? status.split(',') as TicketStatus[] : undefined,
      priority: priority ? priority.split(',') as TicketPriority[] : undefined,
      assigneeId,
      reporterId,
      categoryId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    };

    return this.ticketService.findAll(req.tenantId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  async getStats(@Request() req: any, @Query('type') type?: TicketType) {
    return this.ticketService.getStats(req.tenantId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.ticketService.findById(req.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.ticketService.update(req.tenantId, id, dto, req.user.sub);
  }

  @Post(':id/transition/:toStatus')
  @ApiOperation({ summary: 'Transition ticket to a new status' })
  async transition(
    @Request() req: any,
    @Param('id') id: string,
    @Param('toStatus') toStatus: TicketStatus,
  ) {
    return this.ticketService.transition(req.tenantId, id, toStatus, req.user.sub);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  async addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { content: string; visibility?: 'public' | 'internal' },
  ) {
    return this.ticketService.addComment(
      req.tenantId,
      id,
      req.user.sub,
      dto.content,
      dto.visibility || 'public',
    );
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get ticket comments' })
  async getComments(@Request() req: any, @Param('id') id: string) {
    return this.ticketService.getComments(req.tenantId, id);
  }

  @Post(':id/link')
  @ApiOperation({ summary: 'Link tickets' })
  async linkTickets(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { targetTicketId: string; relationType: string },
  ) {
    return this.ticketService.linkTickets(
      req.tenantId,
      id,
      dto.targetTicketId,
      dto.relationType as any,
    );
  }
}
