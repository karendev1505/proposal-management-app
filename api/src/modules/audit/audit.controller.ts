import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/permissions/permissions.constants';
import { ParseOptionalIntPipe } from '../../common/pipes/parse-optional-int.pipe';
import { ParseOptionalDatePipe } from '../../common/pipes/parse-optional-date.pipe';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AUDIT_VIEW)
  async getAuditLogs(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('startDate', new ParseOptionalDatePipe()) startDate?: Date,
    @Query('endDate', new ParseOptionalDatePipe()) endDate?: Date,
    @Query('limit', new ParseOptionalIntPipe()) limit?: number,
    @Query('offset', new ParseOptionalIntPipe()) offset?: number,
  ) {
    return this.auditService.getAuditLogs(req.workspaceId, {
      userId,
      action,
      entity,
      startDate,
      endDate,
      limit,
      offset,
    });
  }
}

