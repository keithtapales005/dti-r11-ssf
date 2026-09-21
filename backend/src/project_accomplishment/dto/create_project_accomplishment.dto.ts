import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

const ACCOMPLISHMENT_CATEGORIES = [
  'Maintained',
  'Transferred to Successful Cooperator',
  'Transferred to a New Cooperator',
  'Extension of UA for 2 years',
  'Disposed',
  'Fully Transferred with Terminal Report',
];

const OPERATIONAL_STATUSES = ['Fully Operational', 'Partially Operational', 'Non-Operational'];

export class CreateProjectAccomplishmentDto {
    @IsInt()
    project_id!: number;

    @IsOptional()
    @IsString()
    fund_source?: string;

    @IsOptional()
    @IsIn(ACCOMPLISHMENT_CATEGORIES)
    accomplishment_category?: string;

    @IsOptional()
    @IsIn(OPERATIONAL_STATUSES)
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