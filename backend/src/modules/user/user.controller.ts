import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    return this.userService.findById(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req: any, @Body() dto: any) {
    return this.userService.update(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search users in tenant' })
  async search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.userService.searchInTenant(req.tenantId, query, limit);
  }

  @Get('by-role/:role')
  @ApiOperation({ summary: 'Get users by role in tenant' })
  async getByRole(@Request() req: any, @Param('role') role: string) {
    return this.userService.getByRole(req.tenantId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
