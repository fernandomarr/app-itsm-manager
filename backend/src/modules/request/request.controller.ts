import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestService } from './request.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('requests')
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service request' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.requestService.create(req.tenantId, req.user.sub, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get request statistics' })
  async getStats(@Request() req: any) {
    return this.requestService.getStats(req.tenantId);
  }
}
