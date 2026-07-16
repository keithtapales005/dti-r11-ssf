import { IsInt, IsIn } from 'class-validator';

export class ApproveUserDto {
    @IsInt()
    @IsIn([2, 3], { message: 'role_id must be Admin (2) or Viewer (3)' })
    role_id: number;

    @IsInt()
    department_id: number;
}