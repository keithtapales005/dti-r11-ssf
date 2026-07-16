import { API_URL } from "../config";
import { CreateChecklistItemDto, UpdateChecklistItemDto, ChecklistResponse } from "../types/checklist";

export const checklistService = {
    getChecklistByProject: async (projectId: number): Promise<ChecklistResponse> => {
        const res = await fetch(`${API_URL}/project-document-checklist/project/${projectId}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    createChecklistItem: async (dto: CreateChecklistItemDto) => {
        const res = await fetch(`${API_URL}/project-document-checklist`, {
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

    updateChecklistItem: async (id: string, dto: UpdateChecklistItemDto) => {
        const res = await fetch(`${API_URL}/project-document-checklist/${id}`, {
            method: "PATCH",
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

    deleteChecklistItem: async (id: string) => {
        const res = await fetch(`${API_URL}/project-document-checklist/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}