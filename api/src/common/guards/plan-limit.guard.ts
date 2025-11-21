import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';

export const PLAN_LIMIT_KEY = 'planLimit';

export const PlanLimit = (action: string) => {
  return (target: unknown, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(PLAN_LIMIT_KEY, action, descriptor.value);
    } else if (propertyKey) {
      Reflect.defineMetadata(PLAN_LIMIT_KEY, action, target, propertyKey);
    } else {
      Reflect.defineMetadata(PLAN_LIMIT_KEY, action, target);
    }
  };
};

// Map AI actions to subscription actions
const AI_ACTION_MAP: Record<string, 'create_proposal' | 'create_template' | 'send_email'> = {
  ai_generate: 'create_proposal',
  ai_improve: 'create_proposal',
  ai_rewrite: 'create_proposal',
  ai_pricing: 'create_proposal',
};

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => SubscriptionsService))
    private subscriptionsService: SubscriptionsService,
  ) {}

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

    const userId = user.userId || user.id;
    const subscriptionAction = AI_ACTION_MAP[action] || 'create_proposal';

    const canPerform = await this.subscriptionsService.canPerformAction(
      userId,
      subscriptionAction,
    );

    if (!canPerform) {
      const limitsCheck = await this.subscriptionsService.checkUsageLimits(userId);
      const violations = limitsCheck.violations;
      
      throw new ForbiddenException(
        `Plan limit reached for action: ${action}. ${violations.join(', ')}. Please upgrade your plan.`,
      );
    }

    return true;
  }
}
