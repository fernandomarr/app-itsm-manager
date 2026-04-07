import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ITSM Platform API')
    .setDescription('IT Service Management Platform - REST API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tenants', 'Tenant management')
    .addTag('users', 'User management')
    .addTag('tickets', 'Ticket operations')
    .addTag('incidents', 'Incident management')
    .addTag('requests', 'Service requests')
    .addTag('problems', 'Problem management')
    .addTag('changes', 'Change management')
    .addTag('workflows', 'Workflow configuration')
    .addTag('slas', 'SLA management')
    .addTag('integrations', 'Integration connectors')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  logger.info(`Application started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
