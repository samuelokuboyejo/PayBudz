/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
import { DataSource } from 'typeorm';
import { CustomMigrationService } from './migrations/custom.migrations';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  const customMigrationService = app.get(CustomMigrationService);
  await customMigrationService.runMigrations();


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

  // CORS (adjust for your needs)
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Wallet Microservice API')
    .setDescription(
      'A secure, auditable wallet service with ledger-based architecture',
    )
    .setVersion('1.0')
    .addTag('wallets')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  logger.log(`🚀 Wallet microservice running on port ${port}`);
  logger.log(
    `📚 API documentation available at http://localhost:${port}/api/docs`,
  );
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
