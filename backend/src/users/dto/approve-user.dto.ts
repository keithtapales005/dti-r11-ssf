import { IsInt, IsIn, Min } from 'class-validator';

export class ApproveUserDto {
    @IsInt()
    @IsIn([1, 2, 3], { message: 'role_id must be Superadmin (1), Admin (2) or Guest (3)' })
    role_id: number;

    @IsInt()
    @Min(1)
    department_id: number;
}