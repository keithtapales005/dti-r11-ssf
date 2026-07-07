import { API_URL } from "../config";
import {LoginDto} from "../types/auth";

export const authService ={
    Login: async (LoginDto:LoginDto) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: LoginDto.username, password: LoginDto.password }),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    logout: async () => {
        const res = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
    
    getCurrentUser: async () => {
        const res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },
}