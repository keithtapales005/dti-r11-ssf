import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileDto {
    @Type(() => Number)
    @IsInt()
    project_id!: number;

    @IsString()
    @IsNotEmpty()
    file_name!: string;
}