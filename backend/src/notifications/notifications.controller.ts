import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    getNotifications(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('unread_only') unreadOnly?: string,
    ) {
        return this.notificationsService.getNotifications(+page, +limit, unreadOnly === 'true');
    }

    @Get('unread-count')
    getUnreadCount() {
        return this.notificationsService.getUnreadCount();
    }

    @Patch('read-all')
    markAllAsRead() {
        return this.notificationsService.markAllAsRead();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: number) {
        return this.notificationsService.markAsRead(id);
    }
}