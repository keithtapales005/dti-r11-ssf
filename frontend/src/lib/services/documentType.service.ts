import { API_URL } from "../config";
import { DocumentType, ProjectCompleteness } from "../types/documentType";

export const documentTypeService = {
    getAll: async (): Promise<DocumentType[]> => {
        const res = await fetch(`${API_URL}/document-type`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    getCompleteness: async (projectId: number): Promise<ProjectCompleteness> => {
        const res = await fetch(`${API_URL}/document-type/project/${projectId}/completeness`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}