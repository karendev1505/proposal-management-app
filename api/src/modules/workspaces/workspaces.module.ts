import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../../prisma.service';
import { AuditModule } from '../audit/audit.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [AuditModule, EmailsModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, PrismaService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}

