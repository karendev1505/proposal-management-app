import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Users management
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.adminService.getUsers({
      page: pageNum,
      limit: limitNum,
      search,
      role,
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateUser(id, updateData);
  }

  @Delete('users/:id')
  async deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @Put('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  // Payments management
  @Get('payments')
  async getPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.adminService.getPayments({
      page: pageNum,
      limit: limitNum,
      status,
      userId,
    });
  }

  @Get('payments/:id')
  async getPayment(@Param('id') id: string) {
    return this.adminService.getPaymentDetails(id);
  }

  // Statistics
  @Get('stats')
  async getStats() {
    return this.adminService.getAdminStats();
  }

  @Get('stats/revenue')
  async getRevenueStats(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueStats({
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // Plans management (inherited from PlansController but with admin context)
  @Get('plans')
  async getPlans(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveFlag = includeInactive === 'true';
    return this.adminService.getPlans(includeInactiveFlag);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updatePlan(id, updateData);
  }

  // Subscriptions management
  @Get('subscriptions')
  async getSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.adminService.getSubscriptions({
      page: pageNum,
      limit: limitNum,
      status,
      planId,
    });
  }

  @Put('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string) {
    return this.adminService.cancelSubscription(id);
  }

  @Put('subscriptions/:id/reactivate')
  async reactivateSubscription(@Param('id') id: string) {
    return this.adminService.reactivateSubscription(id);
  }

  // System management
  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/logs')
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.adminService.getSystemLogs(level, limitNum);
  }

  // Email management
  @Get('emails')
  async getEmailLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.adminService.getEmailLogs({
      page: pageNum,
      limit: limitNum,
      status,
    });
  }

  @Get('proposals')
  async getProposals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.adminService.getProposals({
      page: pageNum,
      limit: limitNum,
      status,
      userId,
    });
  }
}
