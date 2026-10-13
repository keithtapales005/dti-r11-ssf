import { Controller, Post, Body, Patch, Param, UseGuards, Get, Delete } from '@nestjs/common';
import { ProjectDocumentChecklistService } from './project_document_checklist.service';
import { CreateProjectDocumentChecklistDto } from './dto/create_project_document_checklist.dto';
import { UpdateProjectDocumentChecklistDto } from './dto/update_project_document_checklist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-document-checklist')
export class ProjectDocumentChecklistController {
    constructor(private readonly checklistService: ProjectDocumentChecklistService) { }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Post()
    create(@Body() dto: CreateProjectDocumentChecklistDto, @CurrentUser('user_id') userId: number) {
        return this.checklistService.createChecklistItem(dto, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Patch(':id')
    update(@Body() dto: UpdateProjectDocumentChecklistDto, @Param('id') id: string, @CurrentUser('user_id') userId: number) {
        return this.checklistService.updateChecklistItem(id, dto, userId);
    }

    @Get('project/:projectId')
    getChecklistByProject(@Param('projectId') projectId: number) {
        return this.checklistService.getChecklistByProject(projectId);
    }

    @Roles(Role.SUPERADMIN)
    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser('user_id') userId: number) {
        return this.checklistService.deleteChecklistItem(id, userId);
    }
}