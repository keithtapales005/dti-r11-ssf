export interface LogUser {
    user_id: number;
    first_name: string;
    last_name: string;
}

export interface LogEntry {
    id: number;
    created_at: string;
    user: LogUser | null;
    permission: string;
    role_id: number | null;
    table_name: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "SELF_REGISTER" | "APPROVE" | "REJECT";
    description: string;
}

export interface GetLogsParams {
    page?: number;
    limit?: number;
    date?: string;
    user_id?: number;
    role_id?: number;
    search?: string;
}

export interface LogsResponse {
    data: LogEntry[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}