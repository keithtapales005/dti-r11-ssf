import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator';
import { USER_VALIDATION } from '../constants/user-validation.constants';
export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.FIRST_NAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.FIRST_NAME_MAX_LENGTH)
  first_name!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.LAST_NAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.LAST_NAME_MAX_LENGTH)
  last_name!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.USERNAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.USERNAME_MAX_LENGTH)
  username!: string;

  @IsOptional()
  @IsString()
  @MinLength(USER_VALIDATION.PASSWORD_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.PASSWORD_MAX_LENGTH)
  password!: string;

  @IsOptional()
  @IsInt()
  role_id!: number;

  @IsOptional()
  @IsInt()
  department_id!: number;

  @IsOptional()
  @IsInt()
  user_status_id!: number;
}
