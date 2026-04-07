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
import { WorkflowService } from './workflow.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows for tenant' })
  async findAll(@Request() req: any) {
    return this.workflowService.findAll(req.tenantId);
  }

  @Get('default/:type')
  @ApiOperation({ summary: 'Get default workflow for entity type' })
  async getDefault(@Request() req: any, @Param('type') type: string) {
    return this.workflowService.getDefault(req.tenantId, type as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.workflowService.findById(req.tenantId, id);
  }

  @Post()
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create custom workflow' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.workflowService.create(
      req.tenantId,
      dto.name,
      dto.entityType,
      dto.definition,
    );
  }

  @Put(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update workflow' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.workflowService.update(req.tenantId, id, dto);
  }

  @Post(':id/set-default')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Set workflow as default' })
  async setDefault(@Request() req: any, @Param('id') id: string) {
    return this.workflowService.setAsDefault(req.tenantId, id);
  }

  @Delete(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Delete workflow' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.workflowService.delete(req.tenantId, id);
  }
}
