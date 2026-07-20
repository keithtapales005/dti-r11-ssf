import { API_URL } from "../config";

export const provinceService = {
    getProvinces: async () => {
        const res = await fetch(`${API_URL}/province`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
}