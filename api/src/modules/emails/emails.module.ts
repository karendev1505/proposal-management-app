import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailsService } from './emails.service';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [ConfigModule, TemplatesModule],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
