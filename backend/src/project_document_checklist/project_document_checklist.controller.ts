import { Controller, Post, Body, Patch, Param, UseGuards, Get, Delete } from '@nestjs/common';
import { ProjectDocumentChecklistService } from './project_document_checklist.service';
import { CreateProjectDocumentChecklistDto } from './dto/create_project_document_checklist.dto';
import { UpdateProjectDocumentChecklistDto } from './dto/update_project_document_checklist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project-document-checklist')
export class ProjectDocumentChecklistController {
    constructor(private readonly checklistService: ProjectDocumentChecklistService) {}

    @Post()
    create(@Body() dto: CreateProjectDocumentChecklistDto, @CurrentUser('user_id') userId: number) {
        return this.checklistService.createChecklistItem(dto, userId);
    }

    @Patch(':id')
    update(@Body() dto: UpdateProjectDocumentChecklistDto, @Param('id') id: string, @CurrentUser('user_id') userId: number) {
        return this.checklistService.updateChecklistItem(id, dto, userId);
    }

    @Get('project/:projectId')
    getChecklistByProject(@Param('projectId') projectId: number) {
        return this.checklistService.getChecklistByProject(projectId);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser('user_id') userId: number) {
        return this.checklistService.deleteChecklistItem(id, userId);
    }
}