import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  check(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  ready(): { ready: boolean; timestamp: string } {
    // TODO: Add database connection check
    // TODO: Add Redis connection check
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }
}
