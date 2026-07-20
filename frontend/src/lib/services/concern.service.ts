import { API_URL } from "../config";
<<<<<<< HEAD
import { CreateConcernDto, UpdateConcernDto } from "../types/concern";

export const concernService = {
    createConcern: async (dto: CreateConcernDto) => {
        const res = await fetch(`${API_URL}/project-concern`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    getConcernsForProject: async (projectId: number) => {
        const res = await fetch(`${API_URL}/project-concern/project/${projectId}`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    editConcern: async (id: number, dto: UpdateConcernDto) => {
        const res = await fetch(`${API_URL}/project-concern/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    deleteConcern: async (id: number) => {
        const res = await fetch(`${API_URL}/project-concern/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
=======
import { CreateProjectConcernDto, UpdateProjectConcernDto, ProjectConcern } from "../types/concern";

export const concernService = {
    getConcernsByProject: async (projectId: number): Promise<ProjectConcern[]> => {
        const res = await fetch(`${API_URL}/project-concern/project/${projectId}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    createConcern: async (dto: CreateProjectConcernDto) => {
        const res = await fetch(`${API_URL}/project-concern`, {
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

    updateConcern: async (id: number, dto: UpdateProjectConcernDto) => {
        const res = await fetch(`${API_URL}/project-concern/${id}`, {
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
>>>>>>> origin/feature/backend-project-details
}