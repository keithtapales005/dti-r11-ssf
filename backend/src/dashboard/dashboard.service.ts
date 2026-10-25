import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { Role } from '../auth/enum/role.enum';

type Scope = { restricted: boolean; provinceId: number | null };

@Injectable()
export class DashboardService {
  // Super Admin sees every province. Everyone else sees only their own.
  private async getScope(userId: number): Promise<Scope> {
    const { data: user, error } = await supabase
      .from('users')
      .select('province_id, role(role_name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !user) {
      return { restricted: true, provinceId: null };
    }

    if ((user as any).role?.role_name === Role.SUPERADMIN) {
      return { restricted: false, provinceId: null };
    }

    return { restricted: true, provinceId: user.province_id ?? null };
  }

  // Non-deleted projects, limited to the user's province when restricted.
  // A restricted user with no province matches nothing (-1 is never a real id).
  private projects(select: string, scope: Scope): any {
    let query: any = supabase
      .from('project')
      .select(select)
      .is('deleted_at', null);

    if (scope.restricted) {
      query = query.eq('province_id', scope.provinceId ?? -1);
    }
    return query;
  }

  async getSummary(userId: number) {
    const scope = await this.getScope(userId);

    const { data, error } = await this.projects(
      'project_id, project_cost, project_status:project_status_id(status_name)',
      scope,
    );
    if (error) throw new Error(error.message);

    const rows: any[] = data ?? [];

    const pendingApprovals = rows.filter(
      (row) => row.project_status?.status_name === 'For Approval',
    ).length;

    const totalCost = rows.reduce(
      (sum, row) => sum + (row.project_cost ?? 0),
      0,
    );

    let activeConcerns = 0;
    if (!scope.restricted || rows.length > 0) {
      let concerns = supabase
        .from('project_concern')
        .select('*', { count: 'exact', head: true });

      if (scope.restricted) {
        concerns = concerns.in(
          'project_id',
          rows.map((row) => row.project_id),
        );
      }

      const { count } = await concerns;
      activeConcerns = count ?? 0;
    }

    return {
      totalProjects: rows.length,
      pendingApprovals,
      activeConcerns,
      totalCost,
    };
  }

  async getStatusBreakdown(userId: number) {
    const scope = await this.getScope(userId);
    const { data, error } = await this.projects(
      'project_status:project_status_id(status_name)',
      scope,
    );
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as any[]) {
      const name = row.project_status?.status_name ?? 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([status, count]) => ({ status, count }));
  }

  async getProvinceBreakdown(userId: number) {
    const scope = await this.getScope(userId);
    const { data, error } = await this.projects(
      'province:province_id(province_name)',
      scope,
    );
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as any[]) {
      const name = row.province?.province_name ?? 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([province, count]) => ({ province, count }));
  }

  async getCostTrend(userId: number) {
    const scope = await this.getScope(userId);
    const { data, error } = await this.projects(
      'year_launched, project_cost',
      scope,
    );
    if (error) throw new Error(error.message);

    const totals = new Map<number, number>();
    for (const row of (data ?? []) as any[]) {
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

  async getIndustryBreakdown(userId: number) {
    const scope = await this.getScope(userId);
    const { data, error } = await this.projects('industry', scope);
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as any[]) {
      const name = row.industry ?? 'Unspecified';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts, ([industry, count]) => ({ industry, count }));
  }
}