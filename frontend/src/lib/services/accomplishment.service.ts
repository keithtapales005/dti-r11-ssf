import { API_URL } from "../config";
import { ProjectAccomplishment, UpsertAccomplishmentDto } from "../types/accomplishment";

export const accomplishmentService = {
    getByProject: async (projectId: number): Promise<ProjectAccomplishment | null> => {
        const res = await fetch(`${API_URL}/project-accomplishment/project/${projectId}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    upsert: async (dto: UpsertAccomplishmentDto) => {
        const res = await fetch(`${API_URL}/project-accomplishment`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}