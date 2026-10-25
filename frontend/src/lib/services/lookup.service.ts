import { API_URL } from "../config";
import { LookupList, LookupValue, UpdateLookupDto } from "../types/lookup";

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${API_URL}/lookups${path}`, { credentials: "include", ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const lookupService = {
  getLists: (): Promise<LookupList[]> => request(""),
  getValues: (list: string, includeInactive = false): Promise<LookupValue[]> =>
    request(`/${list}${includeInactive ? "?includeInactive=true" : ""}`),
  create: (list: string, name: string) => request(`/${list}`, jsonInit("POST", { name })),
  update: (list: string, id: number, dto: UpdateLookupDto) => request(`/${list}/${id}`, jsonInit("PATCH", dto)),
  remove: (list: string, id: number) => request(`/${list}/${id}`, { method: "DELETE" }),
};
