const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchWithCredentials = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include", // 👈 THIS is what sends cookies (JWT)
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
};

export async function createUser(payload: any) {
  return fetchWithCredentials(`${API_URL}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUsers() {
  return fetchWithCredentials(`${API_URL}/users/`);
}

export async function getUser(id: number) {
  return fetchWithCredentials(`${API_URL}/users/${id}`);
}

export async function updateUser(id: number, payload: any) {
  return fetchWithCredentials(`${API_URL}/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function checkUsername(username: string) {
  return fetchWithCredentials(
    `${API_URL}/users/check-username/${encodeURIComponent(username)}`
  );
}

console.log("API_URL =", API_URL);