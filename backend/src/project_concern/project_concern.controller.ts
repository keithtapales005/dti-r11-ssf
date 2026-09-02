import { Controller, Post, Body, Patch, Delete, Param, UseGuards, Get } from '@nestjs/common';
import { ProjectConcernService } from './project_concern.service';
import { CreateProjectConcernDto } from './dto/create_project_concern.dto';
import { UpdateProjectConcernDto } from './dto/update_project_concern.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Audit } from '../audit/audit.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project-concern')
export class ProjectConcernController {
    constructor(private readonly projectConcernService: ProjectConcernService) { }

    @Audit('CREATE', 'project_concern')
    @Post()
    create(@Body() dto: CreateProjectConcernDto, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.createConcern(dto, userId);
    }

    @Audit('UPDATE', 'project_concern')
    @Patch(':id')
    update(@Body() dto: UpdateProjectConcernDto, @Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.updateConcern(id, dto, userId);
    }

    @Get(':id')
    getConcern(@Param('id') id: number) {
        return this.projectConcernService.getConcern(id);
    }

    @Get('project/:projectId')
    getConcernsByProject(@Param('projectId') projectId: number) {
        return this.projectConcernService.getConcernsByProject(projectId);
    }

    @Audit('DELETE', 'project_concern')
    @Delete(':id')
    delete(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.deleteConcern(id, userId);
    }
}