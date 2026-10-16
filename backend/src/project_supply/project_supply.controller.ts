import { Controller, Post, Body, Patch, Delete, Param, Get, UseGuards } from '@nestjs/common';
import { ProjectSupplyService } from './project_supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Audit } from '../audit/audit.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-supply')
export class ProjectSupplyController {
    constructor(private readonly projectSupplyService: ProjectSupplyService) { }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Audit('CREATE', 'project_supply')
    @Post()
    create(@Body() dto: CreateSupplyDto, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.createSupply(dto, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Audit('UPDATE', 'project_supply')
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateSupplyDto, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.updateSupply(id, dto, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Audit('DELETE', 'project_supply')
    @Delete(':id')
    remove(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.deleteSupply(id, userId);
    }

    @Get('project/:projectId')
    getForProject(@Param('projectId') projectId: number) {
        return this.projectSupplyService.getSuppliesForProject(projectId);
    }
}