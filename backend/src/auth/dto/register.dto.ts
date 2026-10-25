import { OmitType } from '@nestjs/mapped-types';
import { IsEmail, IsInt, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, [
  'role_id',
  'department_id',
  'user_status_id',
] as const) {
  @IsInt()
  province_id!: number;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email!: string;
}