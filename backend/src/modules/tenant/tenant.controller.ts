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
import { TenantService } from './tenant.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.tenantService.create(dto, req.user.sub);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user tenants' })
  async getMyTenants(@Request() req: any) {
    return this.tenantService.getUserTenants(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async getById(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Put(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.tenantService.update(id, dto);
  }

  @Delete(':id')
  @RequireRoles('owner')
  @ApiOperation({ summary: 'Delete tenant (soft delete)' })
  async delete(@Param('id') id: string) {
    return this.tenantService.delete(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get tenant members' })
  async getMembers(@Param('id') id: string) {
    return this.tenantService.getMembers(id);
  }

  @Post(':id/members')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Add member to tenant' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: { userId: string; role: string },
  ) {
    return this.tenantService.addMember(id, dto.userId, dto.role as 'viewer' | 'member' | 'admin' | 'owner');
  }

  @Put(':id/members/:userId/role')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update member role' })
  async updateRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: { role: string },
  ) {
    return this.tenantService.updateMemberRole(id, userId, dto.role as 'viewer' | 'member' | 'admin' | 'owner');
  }

  @Delete(':id/members/:userId')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Remove member from tenant' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.tenantService.removeMember(id, userId);
  }
}
