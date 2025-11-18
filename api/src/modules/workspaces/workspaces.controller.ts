import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { AuditService } from '../audit/audit.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private auditService: AuditService,
  ) {}

  @Post()
  async createWorkspace(@Request() req: any, @Body() dto: CreateWorkspaceDto) {
    const userId = req.user.userId || req.user.id;
    const workspace = await this.workspacesService.createWorkspace(
      userId,
      dto,
    );

    await this.auditService.logAction({
      userId,
      workspaceId: workspace.id,
      action: 'workspace:created',
      entity: 'workspace',
      entityId: workspace.id,
    });

    return workspace;
  }

  @Get()
  async getUserWorkspaces(@Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Get(':id')
  async getWorkspace(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.getWorkspaceById(id, userId);
  }

  @Put(':id/active')
  async setActiveWorkspace(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.setActiveWorkspace(userId, id);
  }

  @Put(':id')
  async renameWorkspace(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const workspace = await this.workspacesService.renameWorkspace(
      id,
      userId,
      dto,
    );

    await this.auditService.logAction({
      userId,
      workspaceId: id,
      action: 'workspace:renamed',
      entity: 'workspace',
      entityId: id,
      metadata: { name: dto.name },
    });

    return workspace;
  }

  @Delete(':id')
  async deleteWorkspace(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    await this.auditService.logAction({
      userId,
      workspaceId: id,
      action: 'workspace:deleted',
      entity: 'workspace',
      entityId: id,
    });

    return this.workspacesService.deleteWorkspace(id, userId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.getMembers(id, userId);
  }

  @Put(':id/members/:memberId')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: any,
    @Body() dto: UpdateMembershipDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const membership = await this.workspacesService.updateMemberRole(
      id,
      memberId,
      userId,
      dto,
    );

    await this.auditService.logAction({
      userId,
      workspaceId: id,
      action: 'membership:role_updated',
      entity: 'membership',
      entityId: memberId,
      metadata: { role: dto.role },
    });

    return membership;
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId || req.user.id;
    await this.auditService.logAction({
      userId,
      workspaceId: id,
      action: 'membership:removed',
      entity: 'membership',
      entityId: memberId,
    });

    return this.workspacesService.removeMember(id, memberId, userId);
  }

  @Post(':id/invite')
  async inviteMember(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: InviteMemberDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const invite = await this.workspacesService.inviteMember(
      id,
      userId,
      dto,
    );

    await this.auditService.logAction({
      userId,
      workspaceId: id,
      action: 'workspace:invite_sent',
      entity: 'workspace_invite',
      entityId: invite.id,
      metadata: { email: dto.email, role: dto.role },
    });

    return invite;
  }

  @Get('invites')
  async getInvites(@Query('workspaceId') workspaceId: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.getInvites(workspaceId, userId);
  }

  @Delete('invites/:inviteId')
  async cancelInvite(
    @Param('inviteId') inviteId: string,
    @Query('workspaceId') workspaceId: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId || req.user.id;
    return this.workspacesService.cancelInvite(workspaceId, inviteId, userId);
  }

  @Post('join/:token')
  async joinWorkspace(@Param('token') token: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    const result = await this.workspacesService.joinWorkspace(token, userId);

    await this.auditService.logAction({
      userId,
      workspaceId: result.workspace.id,
      action: 'workspace:joined',
      entity: 'workspace',
      entityId: result.workspace.id,
    });

    return result;
  }
}

