import { API_URL } from "../config";
<<<<<<< HEAD
import { CreateProjectDto, UpdateProjectDto } from "../types/project";

export const projectService = {
=======
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

>>>>>>> origin/feature/backend-project-details
    createProject: async (dto: CreateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management`, {
            method: "POST",
            credentials: "include",
<<<<<<< HEAD
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
=======
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
>>>>>>> origin/feature/backend-project-details
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
<<<<<<< HEAD
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
=======

    updateProject: async (id: number, dto: UpdateProjectDto) => {
        const res = await fetch(`${API_URL}/project-management/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
>>>>>>> origin/feature/backend-project-details
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
<<<<<<< HEAD
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
=======
>>>>>>> origin/feature/backend-project-details
}