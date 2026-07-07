import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { USER_VALIDATION } from '../constants/user-validation.constants';
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.FIRST_NAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.FIRST_NAME_MAX_LENGTH)
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.LAST_NAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.LAST_NAME_MAX_LENGTH)
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.USERNAME_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.USERNAME_MAX_LENGTH)
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_VALIDATION.PASSWORD_MIN_LENGTH)
  @MaxLength(USER_VALIDATION.PASSWORD_MAX_LENGTH)
  password!: string;

  @IsInt()
  role_id!: number;

  @IsInt()
  department_id!: number;

  @IsInt()
  user_status_id!: number;
}
