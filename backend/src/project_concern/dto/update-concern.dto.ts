import { IsString, IsOptional, IsIn } from 'class-validator';

const CONCERN_CATEGORIES = ['Challenge', 'Operational Concern', 'Grievance'];

export class UpdateConcernDto {
    @IsOptional() @IsIn(CONCERN_CATEGORIES) category?: string;
    @IsOptional() @IsString() description?: string;
}