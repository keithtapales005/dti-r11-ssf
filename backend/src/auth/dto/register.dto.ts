import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, [
    'role_id',
    'department_id',
    'user_status_id',
] as const) { }