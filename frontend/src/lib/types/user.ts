export interface CreateUserDto {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_id: number;
    department_id: number;
    user_status_id: number;
}
export interface UpdateUserDto {
    username?: string;
    first_name?: string;
    last_name?: string;
    role_id?: number;
    department_id?: number;
    user_status_id?: number;
    password?: string;
}

export interface PendingUser {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_id: number;
    department_id: number;
    user_status_id: number;
    created_at: string;
}

export interface ApproveUserDto {
    role_id: number;
    department_id: number;
}