import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateProjectDto {
  @IsInt()
  province_id!: number;

  @IsInt()
  created_by!: number;

  @IsInt()
  project_status_id!: number;

  @IsString()
  ssf_number!: string;

  @IsString()
  business_name!: string;

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