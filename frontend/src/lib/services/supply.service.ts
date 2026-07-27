import { API_URL } from "../config";
import { CreateSupplyDto, UpdateSupplyDto } from "../types/supply";

export const supplyService = {
    createSupply: async (dto: CreateSupplyDto) => {
        const res = await fetch(`${API_URL}/project-supply`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    getSuppliesForProject: async (projectId: number) => {
        const res = await fetch(`${API_URL}/project-supply/project/${projectId}`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    editSupply: async (id: number, dto: UpdateSupplyDto) => {
        const res = await fetch(`${API_URL}/project-supply/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    deleteSupply: async (id: number) => {
        const res = await fetch(`${API_URL}/project-supply/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
}