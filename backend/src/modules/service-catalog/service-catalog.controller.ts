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
import { ServiceCatalogService } from './service-catalog.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('service-catalog')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('services')
export class ServiceCatalogController {
  constructor(private serviceCatalogService: ServiceCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  async findAll(@Request() req: any) {
    return this.serviceCatalogService.findAll(req.tenantId);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured services' })
  async getFeatured(@Request() req: any) {
    return this.serviceCatalogService.getFeatured(req.tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search services' })
  async search(@Request() req: any, @Query('q') query: string) {
    return this.serviceCatalogService.search(req.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.serviceCatalogService.findById(req.tenantId, id);
  }

  @Post()
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create service' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.serviceCatalogService.create(req.tenantId, dto);
  }

  @Put(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update service' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.serviceCatalogService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Delete service' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.serviceCatalogService.delete(req.tenantId, id);
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories(@Request() req: any) {
    return this.serviceCatalogService.getCategories(req.tenantId);
  }

  @Post('categories')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create category' })
  async createCategory(@Request() req: any, @Body() dto: any) {
    return this.serviceCatalogService.createCategory(req.tenantId, dto);
  }

  @Put('categories/:id')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.serviceCatalogService.updateCategory(req.tenantId, id, dto);
  }
}
