import { IsString, IsInt, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreateSupplyDto {
    @IsInt()
    project_id!: number;

    @IsNotEmpty()
    @IsString()
    item_name!: string;

    @IsInt()
    @Min(1)
    quantity!: number;

    @IsOptional()
    @IsString()
    unit?: string;
}