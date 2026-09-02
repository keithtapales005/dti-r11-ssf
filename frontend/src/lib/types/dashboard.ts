export interface DashboardSummary {
  totalProjects: number;
  pendingApprovals: number;
  activeConcerns: number;
  totalCost: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface ProvinceBreakdown {
  province: string;
  count: number;
}

export interface CostTrend {
  year: number;
  totalCost: number;
}

export interface IndustryBreakdown {
  industry: string;
  count: number;
}