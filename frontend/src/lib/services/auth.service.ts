import { API_URL } from "../config";
import { LoginDto } from "../types/auth";
import { RegisterDto } from "../types/auth";

async function getErrorMessage(res: Response): Promise<string> {
    const text = await res.text();
    try {
        const parsed = JSON.parse(text);
        const message = parsed?.message;
        if (Array.isArray(message)) return message.join(", ");
        return message || "Something went wrong. Please try again.";
    } catch {
        return text || "Something went wrong. Please try again.";
    }
}

export const authService = {

    Register: async (dto: RegisterDto) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
        });
        if (!res.ok) {
            throw new Error(await getErrorMessage(res));
        }
        return res.json();
    },

    Login: async (LoginDto: LoginDto) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: LoginDto.username, password: LoginDto.password }),
        });
        if (!res.ok) {
            throw new Error(await getErrorMessage(res));
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