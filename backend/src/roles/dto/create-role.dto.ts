import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;
}
