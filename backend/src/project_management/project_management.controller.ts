import {
    Controller,
    Post,
    Body,
    Patch,
    Delete,
    Param,
    ParseIntPipe,
    UseGuards,
    Query,
    Get,
} from '@nestjs/common';
import { ProjectManagementService } from './project_management.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Audit } from '../audit/audit.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-management')
export class ProjectManagementController {
    constructor(private readonly projectManagementService: ProjectManagementService) { }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Audit('CREATE', 'project')
    @Post()
    create(@Body() dto: CreateProjectDto, @CurrentUser('user_id') userId: number) {
        return this.projectManagementService.createProject(dto, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Audit('UPDATE', 'project')
    @Patch(':id')
    update(
        @Body() dto: UpdateProjectDto,
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('user_id') userId: number,
    ) {
        return this.projectManagementService.updateProject(id, dto, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Audit('DELETE', 'project')
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('user_id') userId: number,
    ) {
        return this.projectManagementService.deleteProject(id, userId);
    }

    @Get()
    getAllProjects(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @CurrentUser() user: any,
    ) {
        return this.projectManagementService.getAllProjects(+page, +limit, user);
    }

    @Get(':id')
    getProject(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.projectManagementService.getProject(id, user);
    }
}