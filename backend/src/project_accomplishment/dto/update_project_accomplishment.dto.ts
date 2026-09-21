import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectAccomplishmentDto } from './create_project_accomplishment.dto';

export class UpdateProjectAccomplishmentDto extends PartialType(CreateProjectAccomplishmentDto) {}