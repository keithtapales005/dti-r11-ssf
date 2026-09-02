import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class DashboardService {
  async getSummary() {
  const [
    { count: totalProjects },
    { data: statusRows },
    { count: activeConcerns },
    { data: costRows },
  ] = await Promise.all([
    supabase.from('project').select('*', { count: 'exact', head: true }),
    supabase
      .from('project')
      .select('project_status:project_status_id(status_name)'),
    supabase
      .from('project_concern')
      .select('*', { count: 'exact', head: true }),
    supabase.from('project').select('project_cost'),
  ]);

  const pendingApprovals = (statusRows ?? []).filter(
    (row) => (row as any).project_status?.status_name === 'For Approval',
  ).length;

  const totalCost = (costRows ?? []).reduce(
    (sum, row) => sum + (row.project_cost ?? 0),
    0,
  );

  return {
    totalProjects: totalProjects ?? 0,
    pendingApprovals,
    activeConcerns: activeConcerns ?? 0,
    totalCost,
  };
}

  async getStatusBreakdown() {
    const { data, error } = await supabase
      .from('project')
      .select('project_status:project_status_id(status_name)');

    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const name = (row as any).project_status?.status_name ?? 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([status, count]) => ({ status, count }));
  }

  async getProvinceBreakdown() {
    const { data, error } = await supabase
      .from('project')
      .select('province:province_id(province_name)');

    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const name = (row as any).province?.province_name ?? 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([province, count]) => ({ province, count }));
  }

  async getCostTrend() {
    const { data, error } = await supabase
      .from('project')
      .select('year_launched, project_cost');

    if (error) throw new Error(error.message);

    const totals = new Map<number, number>();
    for (const row of data ?? []) {
      if (!row.year_launched) continue;
      totals.set(
        row.year_launched,
        (totals.get(row.year_launched) ?? 0) + (row.project_cost ?? 0),
      );
    }

    return Array.from(totals, ([year, totalCost]) => ({ year, totalCost })).sort(
      (a, b) => a.year - b.year,
    );
  }

  async getIndustryBreakdown() {
    const { data, error } = await supabase.from('project').select('industry');

    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const name = row.industry ?? 'Unspecified';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([industry, count]) => ({ industry, count }));
  }
}