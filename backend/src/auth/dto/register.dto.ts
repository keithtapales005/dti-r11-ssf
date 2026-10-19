import { OmitType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, [
  'role_id',
  'department_id',
  'user_status_id',
] as const) {
  @IsInt()
  province_id!: number;
}