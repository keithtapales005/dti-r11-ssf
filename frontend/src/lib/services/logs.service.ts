import { API_URL } from "../config";
import { GetLogsParams, LogsResponse } from "../types/logs";

export const logsService = {
    getLogs: async (params: GetLogsParams): Promise<LogsResponse> => {
        const query = new URLSearchParams();

        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));
        if (params.date) query.set("date", params.date);
        if (params.user_id) query.set("user_id", String(params.user_id));
        if (params.role_id) query.set("role_id", String(params.role_id));
        if (params.search) query.set("search", params.search);

        const res = await fetch(`${API_URL}/logs?${query.toString()}`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        return res.json();
    },
};