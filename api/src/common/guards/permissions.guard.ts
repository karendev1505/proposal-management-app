import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission, ROLE_PERMISSIONS } from '../permissions/permissions.constants';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

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

    // Get user's membership in the workspace
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

    // Get permissions for the role
    const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      rolePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    // Attach workspace info to request
    request.workspaceId = workspaceId;
    request.workspaceRole = membership.role;

    return true;
  }
}

