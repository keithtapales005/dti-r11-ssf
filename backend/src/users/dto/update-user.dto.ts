import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
  IsIn,
  Min,
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
  @IsIn([1, 2, 3]) // Superadmin, Admin, Guest
  role_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsInt()
  @IsIn([1, 2]) // Active, Blocked. Delete goes through DELETE /users/:id so the anonymization runs
  user_status_id?: number;


}
