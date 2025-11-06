import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Global interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());
    
    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // CORS configuration
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://localhost:3003',
        process.env.CORS_ORIGIN || 'http://localhost:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    const port = process.env.PORT || 3001;
    // Serve uploaded files in local mode
    const storageDriver = process.env.STORAGE_DRIVER || 'local';
    if (storageDriver === 'local') {
      const express = app.getHttpAdapter().getInstance();
      const uploadsPath = require('path').join(process.cwd(), 'api', 'uploads');
      express.use('/uploads', require('express').static(uploadsPath));
      logger.log(`Serving /uploads from ${uploadsPath}`);
    }
    await app.listen(port);
    
    logger.log(`🚀 API Server running on port ${port}`);
    logger.log(`📊 Health check: http://localhost:${port}/health`);
    logger.log(`🔐 Auth endpoints: http://localhost:${port}/auth`);
    logger.log(`📧 Email endpoints: http://localhost:${port}/emails`);
    
  } catch (error) {
    logger.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}

bootstrap();
