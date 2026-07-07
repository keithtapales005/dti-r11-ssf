import { API_URL } from "../config";
import {CreateUserDto, UpdateUserDto} from "../types/user";

export const userService = {
    createUser: async (dto: CreateUserDto) => {
        const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dto)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, {
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    editUser: async (id: number, dto: UpdateUserDto) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dto)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    getUser: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    }
}