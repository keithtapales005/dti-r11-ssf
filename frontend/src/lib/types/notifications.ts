export interface NotificationEntry {
    id: number;
    created_at: string;
    type: "SELF_REGISTER" | "FILE_UPLOAD";
    message: string;
    actor_user_id: number | null;
    reference_table: string | null;
    reference_id: number | null;
    is_read: boolean;
    read_at: string | null;
}

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    unread_only?: boolean;
}

export interface NotificationsResponse {
    data: NotificationEntry[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}