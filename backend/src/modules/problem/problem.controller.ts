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
import { ProblemService } from './problem.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('problems')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('problems')
export class ProblemController {
  constructor(private problemService: ProblemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new problem' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.problemService.create(req.tenantId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all problems' })
  async findAll(@Request() req: any, @Query('status') status?: string) {
    const filters = status ? { status: status.split(',') } : undefined;
    return this.problemService.findAll(req.tenantId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get problem by ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.problemService.findById(req.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update problem' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.problemService.update(req.tenantId, id, dto);
  }

  @Get('kedb/search')
  @ApiOperation({ summary: 'Search known errors database' })
  async searchKEDB(@Request() req: any, @Query('q') query: string) {
    return this.problemService.searchKnownErrors(req.tenantId, query);
  }

  @Get('kedb')
  @ApiOperation({ summary: 'List all known errors' })
  async getKnownErrors(@Request() req: any) {
    return this.problemService.getKnownErrors(req.tenantId);
  }

  @Post('kedb')
  @ApiOperation({ summary: 'Create known error' })
  async createKnownError(@Request() req: any, @Body() dto: any) {
    return this.problemService.createKnownError(req.tenantId, dto);
  }
}
