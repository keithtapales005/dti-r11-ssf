import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_VALIDATION } from '../../users/constants/user-validation.constants';

export class LoginDto {
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
}
