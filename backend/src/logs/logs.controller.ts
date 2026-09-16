import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Roles(Role.SUPERADMIN)
    @Get()
    getLogs(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('date') date?: string,
        @Query('user_id') userId?: number,
        @Query('role_id') roleId?: number,
        @Query('search') search?: string,
    ) {
        return this.logsService.getLogs({
            page: +page,
            limit: +limit,
            date,
            userId: userId ? +userId : undefined,
            roleId: roleId ? +roleId : undefined,
            search,
        });
    }
}