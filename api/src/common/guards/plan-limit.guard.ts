import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PLAN_LIMIT_KEY = 'planLimit';
export const PlanLimit = (action: string) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata(PLAN_LIMIT_KEY, action, descriptor.value);
  } else {
    Reflect.defineMetadata(PLAN_LIMIT_KEY, action, target);
  }
};

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<string>(PLAN_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!action) {
      return true; // No limit check required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // TODO: Implement actual limit checking with SubscriptionsService
    // For now, we'll use a mock implementation
    const canPerform = await this.checkUserLimit(user.id, action);

    if (!canPerform) {
      throw new ForbiddenException(`Plan limit reached for action: ${action}. Please upgrade your plan.`);
    }

    return true;
  }

  private async checkUserLimit(userId: string, action: string): Promise<boolean> {
    // Mock implementation - in real app, inject SubscriptionsService
    // const subscriptionsService = this.subscriptionsService;
    // return subscriptionsService.canPerformAction(userId, action);
    
    // For now, always allow (will be implemented when SubscriptionsService is ready)
    return true;
  }
}
