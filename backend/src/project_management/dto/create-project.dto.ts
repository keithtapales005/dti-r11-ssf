import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
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
}