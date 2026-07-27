import { IsString, IsInt, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

const CONCERN_CATEGORIES = ['Challenge', 'Operational Concern', 'Grievance'];

export class CreateConcernDto {
    @IsInt()
    project_id!: number;

    @IsIn(CONCERN_CATEGORIES)
    category!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsOptional()
    @IsInt()
    reported_by?: number;
}