import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectConcernDto } from './create_project_concern.dto';

export class UpdateProjectConcernDto extends PartialType(CreateProjectConcernDto) {}