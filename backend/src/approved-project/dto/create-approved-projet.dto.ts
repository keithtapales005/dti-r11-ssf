import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
export class CreateApprovedProjectDto {
    @IsNotEmpty()
    @IsInt()
    project_id!: number;
    

    @IsNotEmpty()
    @IsInt()
    approved_project_stage_id!:number;
}