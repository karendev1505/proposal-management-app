import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getUserStats(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.statsService.getUserStats(userId);
  }

  @Get('global')
  async getGlobalStats() {
    // TODO: Add admin role check
    return this.statsService.getGlobalStats();
  }

  // Legacy endpoint for backward compatibility
  @Get('legacy')
  async getLegacyStats() {
    return this.statsService.getStats();
  }
}
