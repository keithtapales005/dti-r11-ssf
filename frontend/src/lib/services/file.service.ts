import { API_URL } from "../config";
import { ProjectFile } from "../types/file";

export const fileService = {
    getFilesByProject: async (projectId: number): Promise<ProjectFile[]> => {
        const res = await fetch(`${API_URL}/files/project/${projectId}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    uploadFile: async (projectId: number, fileName: string, file: File): Promise<ProjectFile> => {
        const formData = new FormData();
        formData.append("project_id", String(projectId));
        formData.append("file_name", fileName);
        formData.append("file", file);

        const res = await fetch(`${API_URL}/files/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    getSignedUrl: async (filePath: string): Promise<{ url: string }> => {
        const res = await fetch(`${API_URL}/files/signed-url?filePath=${encodeURIComponent(filePath)}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    deleteFile: async (fileId: number) => {
        const res = await fetch(`${API_URL}/files/${fileId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    updateFile: async (fileId: number, fileName: string): Promise<ProjectFile> => {
        const res = await fetch(`${API_URL}/files/${fileId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ file_name: fileName }),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}