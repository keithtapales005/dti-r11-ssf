import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const dashboardKeys = {
  summary: ["dashboard", "summary"] as const,
  statusBreakdown: ["dashboard", "status-breakdown"] as const,
  provinceBreakdown: ["dashboard", "province-breakdown"] as const,
  costTrend: ["dashboard", "cost-trend"] as const,
  industryBreakdown: ["dashboard", "industry-breakdown"] as const,
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: dashboardService.getSummary,
  });
};

export const useStatusBreakdown = () => {
  return useQuery({
    queryKey: dashboardKeys.statusBreakdown,
    queryFn: dashboardService.getStatusBreakdown,
  });
};

export const useProvinceBreakdown = () => {
  return useQuery({
    queryKey: dashboardKeys.provinceBreakdown,
    queryFn: dashboardService.getProvinceBreakdown,
  });
};

export const useCostTrend = () => {
  return useQuery({
    queryKey: dashboardKeys.costTrend,
    queryFn: dashboardService.getCostTrend,
  });
};

export const useIndustryBreakdown = () => {
  return useQuery({
    queryKey: dashboardKeys.industryBreakdown,
    queryFn: dashboardService.getIndustryBreakdown,
  });
};