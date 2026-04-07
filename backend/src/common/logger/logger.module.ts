import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Logger } from 'winston';
import { createLogger, transports, format } from 'winston';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: () => {
        return createLogger({
          level: process.env.LOG_LEVEL || 'info',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
          ),
          defaultMeta: { service: 'itsm-backend' },
          transports: [
            new transports.Console({
              format: format.combine(
                format.colorize(),
                format.simple(),
              ),
            }),
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' }),
          ],
        });
      },
    },
    LoggerService,
  ],
  exports: [Logger, LoggerService],
})
export class LoggerModule {}
