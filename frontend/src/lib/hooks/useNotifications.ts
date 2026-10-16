import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import { GetNotificationsParams } from "../types/notifications";

export const useUnreadCount = (enabled: boolean) =>
    useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: notificationsService.getUnreadCount,
        enabled,
        refetchInterval: 30000, // poll every 30s so new notifications show up
    });

export const useNotifications = (params: GetNotificationsParams, enabled: boolean) =>
    useQuery({
        queryKey: ["notifications", "list", params],
        queryFn: () => notificationsService.getNotifications(params),
        enabled,
    });

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => notificationsService.markAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsService.markAllAsRead(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};