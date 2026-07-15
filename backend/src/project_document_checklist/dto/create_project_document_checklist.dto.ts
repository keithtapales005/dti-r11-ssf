import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateProjectDocumentChecklistDto {
    @IsInt()
    project_id!: number;

    @IsString()
    @IsNotEmpty()
    document_name!: string;

    @IsOptional()
    @IsIn(['Pending', 'Uploaded', 'Verified'])
    status?: string;
}