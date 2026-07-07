import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator';
export class UpdateProjectDto {
    @IsOptional()
    @IsInt()
    province_id!: number;

    @IsOptional()
    @IsInt()
    created_by!: number;

    @IsOptional()
    @IsInt()
    project_status_id!: number;

    @IsOptional()
    @IsString()
    ssf_number!: string;

    @IsOptional()
    @IsString()
    business_name!: string;

    @IsOptional()
    @IsString()
    project_title!: string;
}