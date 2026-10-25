import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateProjectAccomplishmentDto {
    @IsInt()
    project_id!: number;

    @IsOptional()
    @IsString()
    fund_source?: string;

    @IsOptional()
    @IsString()
    accomplishment_category?: string;

    @IsOptional()
    @IsString()
    operational_status?: string;

    @IsOptional()
    @IsNumber()
    amount_disbursed?: number;

    @IsOptional()
    @IsInt()
    msmes_assisted_male?: number;

    @IsOptional()
    @IsInt()
    msmes_assisted_female?: number;

    @IsOptional()
    @IsInt()
    other_users_assisted_male?: number;

    @IsOptional()
    @IsInt()
    other_users_assisted_female?: number;

    @IsOptional()
    @IsInt()
    employment_generated_male?: number;

    @IsOptional()
    @IsInt()
    employment_generated_female?: number;

    @IsOptional()
    @IsNumber()
    sales_generated?: number;

    @IsOptional()
    @IsNumber()
    income_generated?: number;

    @IsOptional()
    @IsNumber()
    accumulated_depreciation?: number;

    @IsOptional()
    @IsNumber()
    book_value_of_equipment?: number;
}