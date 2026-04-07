import { Injectable, Logger } from '@nestjs/common';
import { WinstonLogger } from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: WinstonLogger;

  constructor(logger: Logger) {
    this.logger = logger as WinstonLogger;
  }

  /**
   * Log tenant-scoped action
   */
  logTenantAction(
    tenantId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.info('Tenant Action', {
      tenantId,
      userId,
      action,
      resource,
      resourceId,
      ...metadata,
    });
  }

  /**
   * Log audit event
   */
  logAudit(
    userId: string,
    action: string,
    details: Record<string, any>,
  ): void {
    this.logger.info('Audit Event', {
      userId,
      action,
      ...details,
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logger.error(message, {
      ...context,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, context);
  }
}
