import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('incidents')
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.incidentService.create(req.tenantId, req.user.sub, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get incident statistics' })
  async getStats(@Request() req: any) {
    return this.incidentService.getStats(req.tenantId);
  }

  @Get('unassigned')
  @ApiOperation({ summary: 'Get unassigned incidents' })
  async getUnassigned(@Request() req: any) {
    return this.incidentService.getUnassigned(req.tenantId);
  }
}
