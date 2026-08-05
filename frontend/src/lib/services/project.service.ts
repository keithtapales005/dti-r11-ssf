import { API_URL } from "../config";
import { CreateProjectDto, UpdateProjectDto, Project } from "../types/project";

export const projectService = {
    getProject: async (id: number): Promise<Project> => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    getAllProjects: async (page = 1, limit = 10) => {
        const res = await fetch(`${API_URL}/project-management?page=${page}&limit=${limit}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    createProject: async (dto: CreateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management`, {
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

    updateProject: async (id: number, dto: UpdateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
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

    deleteProject: async (id: number) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}