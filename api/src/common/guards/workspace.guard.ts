import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get workspace ID from query, params, or body
    const workspaceId =
      request.query?.workspaceId ||
      request.params?.workspaceId ||
      request.body?.workspaceId ||
      user.activeWorkspaceId;

    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID is required');
    }

    // Verify membership
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach workspace info to request
    request.workspaceId = workspaceId;
    request.workspaceRole = membership.role;

    return true;
  }
}

