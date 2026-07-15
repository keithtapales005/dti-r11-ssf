import {
  IsString,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateProjectConcernDto {
    @IsInt()
    project_id!: number;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;
}