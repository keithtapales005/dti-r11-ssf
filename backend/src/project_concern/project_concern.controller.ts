import { Controller, Post, Body, Patch, Delete, Param, Get, UseGuards } from '@nestjs/common';
import { ProjectConcernService } from './project_concern.service';
import { CreateConcernDto } from './dto/create-concern.dto';
import { UpdateConcernDto } from './dto/update-concern.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project-concern')
export class ProjectConcernController {
    constructor(private readonly projectConcernService: ProjectConcernService) {}

    @Post()
    create(@Body() dto: CreateConcernDto, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.createConcern(dto, userId);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateConcernDto, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.updateConcern(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectConcernService.deleteConcern(id, userId);
    }

    @Get('project/:projectId')
    getForProject(@Param('projectId') projectId: number) {
        return this.projectConcernService.getConcernsForProject(projectId);
    }
}