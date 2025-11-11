import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubscriptionStatus } from '@prisma/client';

export class CreateSubscriptionDto {
  planId: string;
}

export class UpdateSubscriptionDto {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionFiltersDto {
  status?: SubscriptionStatus;
  planId?: string;
  limit?: number;
  offset?: number;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('my')
  async getMySubscription(@Request() req) {
    return this.subscriptionsService.getActivePlan(req.user.id);
  }

  @Get('my/stats')
  async getMySubscriptionStats(@Request() req) {
    return this.subscriptionsService.getSubscriptionStats(req.user.id);
  }

  @Get('my/usage')
  async getMyUsage(@Request() req) {
    return this.subscriptionsService.getUserUsage(req.user.id);
  }

  @Get('my/limits')
  async checkMyLimits(@Request() req) {
    return this.subscriptionsService.checkUsageLimits(req.user.id);
  }

  @Post()
  async createSubscription(
    @Request() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(
      req.user.id,
      createSubscriptionDto.planId,
    );
  }

  @Put('upgrade')
  async upgradeSubscription(
    @Request() req,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionsService.upgradePlan(req.user.id, body.planId);
  }

  @Put('cancel')
  async cancelSubscription(
    @Request() req,
    @Body() body: { immediate?: boolean } = {},
  ) {
    return this.subscriptionsService.cancelSubscription(
      req.user.id,
      body.immediate || false,
    );
  }

  // Admin endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllSubscriptions(@Query() filters: SubscriptionFiltersDto) {
    return this.subscriptionsService.getAllSubscriptions(filters);
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getActivePlan(userId);
  }

  @Get(':userId/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserSubscriptionStats(@Param('userId') userId: string) {
    return this.subscriptionsService.getSubscriptionStats(userId);
  }

  @Post(':userId/upgrade')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async upgradeUserSubscription(
    @Param('userId') userId: string,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionsService.upgradePlan(userId, body.planId);
  }

  @Put(':userId/cancel')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async cancelUserSubscription(
    @Param('userId') userId: string,
    @Body() body: { immediate?: boolean } = {},
  ) {
    return this.subscriptionsService.cancelSubscription(
      userId,
      body.immediate || false,
    );
  }
}
