import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // Returns the calculated report data as JSON (useful for previewing and testing
    // before the Excel export is wired up)
    @Get('bottomline-accomplishment/data')
    getBottomlineData() {
        return this.reportsService.getBottomlineAccomplishmentData();
    }
}