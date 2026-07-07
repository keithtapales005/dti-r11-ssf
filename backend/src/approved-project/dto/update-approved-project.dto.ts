import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
export class UpdateApprovedProjectDto {
  
    @IsInt()
    approved_project_stage_id!:number;
}