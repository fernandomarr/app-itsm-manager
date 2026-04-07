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
import { SlaService } from './sla.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('slas')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('slas')
export class SlaController {
  constructor(private slaService: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all SLAs for tenant' })
  async findAll(@Request() req: any) {
    return this.slaService.findAll(req.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SLA by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.slaService.findById(req.tenantId, id);
  }

  @Post()
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create SLA policy' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.slaService.create(req.tenantId, dto);
  }

  @Put(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update SLA' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.slaService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Delete SLA (soft delete)' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.slaService.delete(req.tenantId, id);
  }
}
