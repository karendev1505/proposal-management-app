import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../../prisma.service';
import { EmailsModule } from '../emails/emails.module';
import { TemplatesModule } from '../templates/templates.module';
import { FilesModule } from '../files/files.module';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [EmailsModule, TemplatesModule, FilesModule],
  controllers: [ProposalsController],
  providers: [ProposalsService, PrismaService, PdfService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
