import { API_URL } from "../config";

export const projectStatusService = {
    getProjectStatuses: async () => {
        const res = await fetch(`${API_URL}/project-status`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
}