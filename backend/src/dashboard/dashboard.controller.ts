import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser('user_id') userId: number) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('status-breakdown')
  getStatusBreakdown(@CurrentUser('user_id') userId: number) {
    return this.dashboardService.getStatusBreakdown(userId);
  }

  @Get('province-breakdown')
  getProvinceBreakdown(@CurrentUser('user_id') userId: number) {
    return this.dashboardService.getProvinceBreakdown(userId);
  }

  @Get('cost-trend')
  getCostTrend(@CurrentUser('user_id') userId: number) {
    return this.dashboardService.getCostTrend(userId);
  }

  @Get('industry-breakdown')
  getIndustryBreakdown(@CurrentUser('user_id') userId: number) {
    return this.dashboardService.getIndustryBreakdown(userId);
  }
}