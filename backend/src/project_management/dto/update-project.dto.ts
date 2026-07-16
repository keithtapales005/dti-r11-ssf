import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
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

    @IsOptional()
    @IsInt()
    year_launched?: number;

    @IsOptional()
    @IsDateString()
    date_established?: string;

    @IsOptional()
    @IsString()
    industry?: string;

    @IsOptional()
    @IsNumber()
    project_cost?: number;
}