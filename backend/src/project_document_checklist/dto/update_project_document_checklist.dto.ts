import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDocumentChecklistDto } from './create_project_document_checklist.dto';

export class UpdateProjectDocumentChecklistDto extends PartialType(CreateProjectDocumentChecklistDto) {}