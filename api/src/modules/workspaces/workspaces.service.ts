import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { WorkspaceRole } from '@prisma/client';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { EmailsService } from '../emails/emails.service';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService,
    private configService: ConfigService,
  ) {}

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    // Generate unique slug
    const baseSlug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Set as active workspace
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: workspace.id },
    });

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    // Use include to avoid N+1 queries - all data fetched in single query
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      memberCount: m.workspace._count.members,
    }));
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      include: {
        workspace: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return {
      ...membership.workspace,
      role: membership.role,
    };
  }

  async setActiveWorkspace(userId: string, workspaceId: string) {
    // Verify membership
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: workspaceId },
    });

    return { success: true };
  }

  async renameWorkspace(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ) {
    const membership = await this.getMembershipOrThrow(workspaceId, userId);

    // Only owner can rename
    if (membership.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Only owner can rename workspace');
    }

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: dto.name },
    });

    return workspace;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const membership = await this.getMembershipOrThrow(workspaceId, userId);

    // Only owner can delete
    if (membership.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Only owner can delete workspace');
    }

    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true };
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.getMembershipOrThrow(workspaceId, userId);

    const members = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first
        { joinedAt: 'asc' },
      ],
    });

    return members;
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    dto: UpdateMembershipDto,
  ) {
    const requesterMembership = await this.getMembershipOrThrow(
      workspaceId,
      userId,
    );

    // Only owner and admin can update roles
    if (
      requesterMembership.role !== WorkspaceRole.OWNER &&
      requesterMembership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only owner and admin can update member roles',
      );
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    // Owner cannot change owner role
    if (
      targetMembership.role === WorkspaceRole.OWNER &&
      requesterMembership.role !== WorkspaceRole.OWNER
    ) {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Cannot change to owner (only through transfer)
    if (dto.role === WorkspaceRole.OWNER) {
      throw new BadRequestException('Cannot assign owner role directly');
    }

    const updated = await this.prisma.membership.update({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async removeMember(workspaceId: string, memberId: string, userId: string) {
    const requesterMembership = await this.getMembershipOrThrow(
      workspaceId,
      userId,
    );

    // Only owner and admin can remove members
    if (
      requesterMembership.role !== WorkspaceRole.OWNER &&
      requesterMembership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only owner and admin can remove members',
      );
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove owner
    if (targetMembership.role === WorkspaceRole.OWNER) {
      throw new BadRequestException('Cannot remove workspace owner');
    }

    // Cannot remove yourself if you're the only admin
    if (memberId === userId && requesterMembership.role === WorkspaceRole.ADMIN) {
      const adminCount = await this.prisma.membership.count({
        where: {
          workspaceId,
          role: WorkspaceRole.ADMIN,
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Cannot remove yourself as the only admin',
        );
      }
    }

    await this.prisma.membership.delete({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    return { success: true };
  }

  async inviteMember(
    workspaceId: string,
    userId: string,
    dto: InviteMemberDto,
  ) {
    const membership = await this.getMembershipOrThrow(workspaceId, userId);

    // Only owner and admin can invite
    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Only owner and admin can invite members');
    }

    // Check if user already exists and is a member
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId,
          },
        },
      });

      if (existingMembership) {
        throw new BadRequestException('User is already a member');
      }
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        email: dto.email,
        token,
        role: dto.role,
        expiresAt,
        workspaceId,
        invitedBy: userId,
      },
      include: {
        workspace: true,
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email invitation
    try {
      const appUrl = this.configService.get('PUBLIC_APP_URL', 'http://localhost:3000');
      const joinUrl = `${appUrl}/workspaces/join/${token}`;

      await this.emailsService.sendTemplateEmail({
        to: dto.email,
        subject: `Invitation to join ${invite.workspace.name}`,
        template: 'workspace-invite',
        data: {
          workspaceName: invite.workspace.name,
          role: dto.role,
          joinUrl,
          expiresAt: expiresAt.toLocaleDateString(),
          inviterName: invite.inviter.name || invite.inviter.email,
        },
      });
    } catch (error) {
      this.logger.error('Failed to send invitation email:', error);
      // Don't throw - invite is still created
    }

    return invite;
  }

  async joinWorkspace(token: string, userId: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invite has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.email !== invite.email) {
      throw new ForbiddenException(
        'This invite is for a different email address',
      );
    }

    // Create membership
    await this.prisma.membership.create({
      data: {
        userId,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });

    // Mark invite as accepted
    await this.prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    // Set as active workspace
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: invite.workspaceId },
    });

    return {
      success: true,
      workspace: invite.workspace,
    };
  }

  async getInvites(workspaceId: string, userId: string) {
    const membership = await this.getMembershipOrThrow(workspaceId, userId);

    // Only owner and admin can view invites
    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Only owner and admin can view invites');
    }

    const invites = await this.prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
      },
      include: {
        inviter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invites;
  }

  async cancelInvite(workspaceId: string, inviteId: string, userId: string) {
    const membership = await this.getMembershipOrThrow(workspaceId, userId);

    // Only owner and admin can cancel invites
    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Only owner and admin can cancel invites');
    }

    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.workspaceId !== workspaceId) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Cannot cancel accepted invite');
    }

    await this.prisma.workspaceInvite.delete({
      where: { id: inviteId },
    });

    return { success: true };
  }

  private async getMembershipOrThrow(workspaceId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return membership;
  }
}

