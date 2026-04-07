import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('integrations')
export class IntegrationController {
  constructor(private integrationService: IntegrationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  async findAll(@Request() req: any) {
    return this.integrationService.findAll(req.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.integrationService.findById(req.tenantId, id);
  }

  @Post()
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create integration' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.integrationService.create(req.tenantId, dto);
  }

  @Put(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update integration' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.integrationService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Delete integration' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.integrationService.delete(req.tenantId, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  async testConnection(@Request() req: any, @Param('id') id: string) {
    return this.integrationService.testConnection(req.tenantId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get integration logs' })
  async getLogs(@Request() req: any, @Param('id') id: string) {
    return this.integrationService.getLogs(req.tenantId, id);
  }

  @Post(':id/trigger')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Trigger webhook manually' })
  async trigger(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.integrationService.triggerWebhook(req.tenantId, {
      integrationId: id,
      eventType: dto.eventType,
      payload: dto.payload,
    });
  }
}
