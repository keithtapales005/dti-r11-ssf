import { API_URL } from "../config";
import { GetNotificationsParams, NotificationsResponse } from "../types/notifications";

export const notificationsService = {
    getNotifications: async (params: GetNotificationsParams): Promise<NotificationsResponse> => {
        const query = new URLSearchParams();
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));
        if (params.unread_only) query.set("unread_only", "true");

        const res = await fetch(`${API_URL}/notifications?${query.toString()}`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    markAsRead: async (id: number) => {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: "PATCH",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    markAllAsRead: async () => {
        const res = await fetch(`${API_URL}/notifications/read-all`, {
            method: "PATCH",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};