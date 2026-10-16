import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentTypeService } from './document_type.service';

@UseGuards(JwtAuthGuard)
@Controller('document-type')
export class DocumentTypeController {
    constructor(private readonly documentTypeService: DocumentTypeService) {}

    @Get()
    getAll() {
        return this.documentTypeService.getAll();
    }

    @Get('project/:projectId/completeness')
    getProjectCompleteness(@Param('projectId') projectId: number) {
        return this.documentTypeService.getProjectCompleteness(Number(projectId));
    }
}