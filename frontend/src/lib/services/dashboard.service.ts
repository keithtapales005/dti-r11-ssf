import { API_URL } from "../config";
import {
  DashboardSummary,
  StatusBreakdown,
  ProvinceBreakdown,
  CostTrend,
  IndustryBreakdown,
} from "../types/dashboard";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch(`${API_URL}/dashboard/summary`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getStatusBreakdown: async (): Promise<StatusBreakdown[]> => {
    const res = await fetch(`${API_URL}/dashboard/status-breakdown`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getProvinceBreakdown: async (): Promise<ProvinceBreakdown[]> => {
    const res = await fetch(`${API_URL}/dashboard/province-breakdown`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getCostTrend: async (): Promise<CostTrend[]> => {
    const res = await fetch(`${API_URL}/dashboard/cost-trend`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getIndustryBreakdown: async (): Promise<IndustryBreakdown[]> => {
    const res = await fetch(`${API_URL}/dashboard/industry-breakdown`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};