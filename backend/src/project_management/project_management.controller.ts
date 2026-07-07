import { Controller, Post,Body,Patch, Param, UseGuards, Query } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ProjectManagementService } from './project_management.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project-management')
export class ProjectManagementController {
    constructor(private readonly projectManagementService: ProjectManagementService) {}

    @Post()
    create(@Body() dto: CreateProjectDto, @CurrentUser('user_id') userId: number) {
        return this.projectManagementService.createProject(dto, userId);
      }
    @Patch(':id')
    update(@Body() dto: UpdateProjectDto, @Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectManagementService.updateProject(id, dto, userId);
      }
    @Get()
    getAllProjects(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.projectManagementService.getAllProjects(+page, +limit);
    }
    @Get(':id')
    getProject(@Param('id') id: number) {
        return this.projectManagementService.getProject(id);
    }
}
