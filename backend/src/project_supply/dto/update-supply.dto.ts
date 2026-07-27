import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSupplyDto {
    @IsOptional() @IsString() item_name?: string;
    @IsOptional() @IsInt() @Min(1) quantity?: number;
    @IsOptional() @IsString() unit?: string;
}