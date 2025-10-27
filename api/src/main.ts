import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

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
