import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';
import { TemplateService } from './services/template.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService, TemplateService],
  exports: [EmailService],
})
export class EmailModule {}
