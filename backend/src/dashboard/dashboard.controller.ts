import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('status-breakdown')
  getStatusBreakdown() {
    return this.dashboardService.getStatusBreakdown();
  }

  @Get('province-breakdown')
  getProvinceBreakdown() {
    return this.dashboardService.getProvinceBreakdown();
  }

  @Get('cost-trend')
  getCostTrend() {
    return this.dashboardService.getCostTrend();
  }

  @Get('industry-breakdown')
  getIndustryBreakdown() {
    return this.dashboardService.getIndustryBreakdown();
  }
}