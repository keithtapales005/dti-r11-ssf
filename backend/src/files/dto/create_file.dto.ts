import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileDto {
    @Type(() => Number)
    @IsInt()
    project_id!: number;

    @IsString()
    @IsNotEmpty()
    file_name!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    document_type_id?: number;
}