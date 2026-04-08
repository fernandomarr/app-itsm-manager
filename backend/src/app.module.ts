import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Config
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { QueueModule } from './infrastructure/queue/queue.module';

// Common
import { LoggerModule } from './common/logger/logger.module';
import { AuthGuardModule } from './common/guards/auth-guard.module';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';

// Domain Modules
import { TicketModule } from './modules/ticket/ticket.module';
import { IncidentModule } from './modules/incident/incident.module';
import { RequestModule } from './modules/request/request.module';
import { ProblemModule } from './modules/problem/problem.module';
import { ChangeModule } from './modules/change/change.module';

// Shared Modules
import { WorkflowModule } from './modules/workflow/workflow.module';
import { SlaModule } from './modules/sla/sla.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';

// Health
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Message queue
    BullModule.forRoot({
      redis: RedisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),

    // Infrastructure
    DatabaseModule,
    CacheModule,
    QueueModule,
    LoggerModule,
    AuthGuardModule,

    // Core modules
    AuthModule,
    TenantModule,
    UserModule,

    // Domain modules
    TicketModule,
    IncidentModule,
    RequestModule,
    ProblemModule,
    ChangeModule,

    // Shared modules
    WorkflowModule,
    SlaModule,
    IntegrationModule,
    NotificationModule,
    ServiceCatalogModule,

    // Health
    HealthModule,
  ],
})
export class AppModule {}
