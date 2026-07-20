import { API_URL } from "../config";
import { CreateProjectDto, UpdateProjectDto } from "../types/project";

export const projectService = {
    createProject: async (dto: CreateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    getProjects: async (page = 1, limit = 10) => {
        const res = await fetch(`${API_URL}/project-management?page=${page}&limit=${limit}`, {
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    getProject: async (id: number) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    editProject: async (id: number, dto: UpdateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    deleteProject: async (id: number) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    }
}