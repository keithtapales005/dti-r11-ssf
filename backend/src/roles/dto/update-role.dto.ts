import { IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsString()
  created_at?: string;

  @IsString()
  updated_at?: string;
}
