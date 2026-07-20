import { Module } from '@nestjs/common';
import { ProjectDocumentChecklistController } from './project_document_checklist.controller';
import { ProjectDocumentChecklistService } from './project_document_checklist.service';

@Module({
      controllers: [ProjectDocumentChecklistController],
      providers: [ProjectDocumentChecklistService],
    })

export class ProjectDocumentChecklistModule {}