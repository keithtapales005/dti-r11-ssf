import { API_URL } from "../config";
import { BottomlineAccomplishmentReport } from "../types/report";

export const reportService = {
    getBottomlineAccomplishment: async (): Promise<BottomlineAccomplishmentReport> => {
        const res = await fetch(`${API_URL}/reports/bottomline-accomplishment/data`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}