import { Controller, Body, Patch, Param, UseGuards, Get, ParseIntPipe } from '@nestjs/common';
import { ProjectDocumentChecklistService } from './project_document_checklist.service';
import { UpdateProjectDocumentChecklistDto } from './dto/update_project_document_checklist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';

// The checklist is generated from the required document types, so there is no
// endpoint to add or delete items. Only verifying a document is done by hand.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-document-checklist')
export class ProjectDocumentChecklistController {
    constructor(private readonly checklistService: ProjectDocumentChecklistService) { }

    @Roles(Role.SUPERADMIN)
    @Patch(':id')
    update(@Body() dto: UpdateProjectDocumentChecklistDto, @Param('id', ParseIntPipe) id: number, @CurrentUser('user_id') userId: number) {
        return this.checklistService.updateChecklistItem(id, dto, userId);
    }

    @Get('project/:projectId')
    getChecklistByProject(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.checklistService.getChecklistByProject(projectId);
    }
}
