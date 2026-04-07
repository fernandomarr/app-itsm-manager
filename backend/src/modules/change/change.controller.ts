import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChangeService } from './change.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('changes')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('changes')
export class ChangeController {
  constructor(private changeService: ChangeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new change request' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.changeService.create(req.tenantId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all changes' })
  async findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.changeService.findAll(req.tenantId, { type, status });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get change calendar' })
  async getCalendar(
    @Request() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.changeService.getCalendar(req.tenantId, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get change by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.changeService.findById(req.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update change request' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.changeService.update(req.tenantId, id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit change for approval' })
  async submit(@Request() req: any, @Param('id') id: string) {
    return this.changeService.submit(req.tenantId, id);
  }

  @Post(':id/schedule-cab')
  @ApiOperation({ summary: 'Schedule CAB meeting' })
  async scheduleCab(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { meetingDate: string },
  ) {
    return this.changeService.scheduleCab(req.tenantId, id, dto.meetingDate);
  }

  @Post(':id/cab-decision')
  @ApiOperation({ summary: 'Record CAB decision' })
  async recordCabDecision(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { memberId: string; vote: string; comments?: string },
  ) {
    return this.changeService.recordCabDecision(
      req.tenantId,
      id,
      dto.memberId,
      dto.vote as any,
      dto.comments,
    );
  }

  @Post(':id/implement')
  @ApiOperation({ summary: 'Start implementing change' })
  async implement(@Request() req: any, @Param('id') id: string) {
    return this.changeService.implement(req.tenantId, id, new Date().toISOString());
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete change implementation' })
  async complete(@Request() req: any, @Param('id') id: string) {
    return this.changeService.complete(req.tenantId, id, new Date().toISOString());
  }

  @Get('cab/members')
  @ApiOperation({ summary: 'Get CAB members' })
  async getCabMembers(@Request() req: any) {
    return this.changeService.getCabMembers(req.tenantId);
  }

  @Post('cab/members')
  @ApiOperation({ summary: 'Add CAB member' })
  async addCabMember(@Request() req: any, @Body() dto: { userId: string }) {
    return this.changeService.addCabMember(req.tenantId, dto.userId);
  }
}
