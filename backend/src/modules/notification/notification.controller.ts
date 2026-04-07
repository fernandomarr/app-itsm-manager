import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RequireRoles } from '../../common/guards/roles.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('templates')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Get notification templates' })
  async getTemplates(@Request() req: any) {
    return this.notificationService.getTemplates(req.tenantId);
  }

  @Post('templates')
  @RequireRoles('admin', 'owner')
  @ApiOperation({ summary: 'Create notification template' })
  async createTemplate(@Request() req: any, @Body() dto: any) {
    return this.notificationService.createTemplate(req.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getMyNotifications(@Request() req: any, @Query('limit') limit?: number) {
    return this.notificationService.getUserNotifications(
      req.tenantId,
      req.user.sub,
      limit,
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
