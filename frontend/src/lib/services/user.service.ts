import { API_URL } from "../config";
import { CreateUserDto, UpdateUserDto, ApproveUserDto } from "../types/user";

export const userService = {
    createUser: async (dto: CreateUserDto) => {
        const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    editUser: async (id: number, dto: UpdateUserDto) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getUser: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },


    deleteUser: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_status_id: 3 }), // Deleted
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getPendingUsers: async () => {
        const res = await fetch(`${API_URL}/users/pending`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    approveUser: async (id: number, dto: ApproveUserDto) => {
        const res = await fetch(`${API_URL}/users/${id}/approve`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    rejectUser: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}/reject`, {
            method: "PATCH",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};