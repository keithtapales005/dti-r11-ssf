import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SELF_REGISTER' | 'APPROVE' | 'REJECT';

interface GetLogsParams {
    page: number;
    limit: number;
    date?: string;
    userId?: number;
    roleId?: number;
    search?: string;
}

@Injectable()
export class LogsService {
    private descriptions: Record<string, Partial<Record<LogAction, string>>> = {
        users: {
            CREATE: 'Account created for a new user.',
            UPDATE: 'Account details updated.',
            LOGIN: 'User logged in.',
            LOGOUT: 'User logged out of the active session.',
            SELF_REGISTER: 'Submitted a self-registration request.',
            APPROVE: 'Account was approved and activated.',
            REJECT: 'Registration was rejected.',
        },
        project: {
            CREATE: 'New project record created.',
            UPDATE: 'Project details updated.',
            DELETE: 'Project removed.',
        },
        project_concern: {
            CREATE: 'New concern reported.',
            UPDATE: 'Concern details updated.',
            DELETE: 'Concern removed.',
        },
        project_supply: {
            CREATE: 'New supply item added.',
            UPDATE: 'Supply item updated.',
            DELETE: 'Supply item removed.',
        },
    };

    private buildDescription(tableName: string | undefined, action: LogAction): string {
        if (tableName && this.descriptions[tableName]?.[action]) {
            return this.descriptions[tableName][action]!;
        }
        return `${action} performed on ${tableName ?? 'record'}.`;
    }

    async getLogs(params: GetLogsParams) {
        const { page, limit, date, userId, roleId, search } = params;
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
            .from('logs')
            .select(
                `
        id,
        created_at,
        action,
        table_name,
        affected_id,
        user_id,
        users:user_id ( user_id, first_name, last_name, role_id, role:role_id ( role_id, role_name ) )
      `,
                { count: 'exact' },
            )
            .order('created_at', { ascending: false });

        if (date) {
            const start = `${date}T00:00:00`;
            const end = `${date}T23:59:59`;
            query = query.gte('created_at', start).lte('created_at', end);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) {
            throw new Error(error.message);
        }

        let rows = (data ?? []).map((log: any) => ({
            id: log.id,
            created_at: log.created_at,
            user: log.users
                ? {
                    user_id: log.users.user_id,
                    first_name: log.users.first_name,
                    last_name: log.users.last_name,
                }
                : null,
            permission: log.users?.role?.role_name ?? 'Unknown',
            role_id: log.users?.role?.role_id ?? null,
            table_name: log.table_name,
            action: log.action,
            description: this.buildDescription(log.table_name, log.action),
        }));

        // Role/permission filter applied after the join, since it's nested
        if (roleId) {
            rows = rows.filter((row) => row.role_id === roleId);
        }

        // Search applied against user name and description
        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter((row) => {
                const name = `${row.user?.first_name ?? ''} ${row.user?.last_name ?? ''}`.toLowerCase();
                return name.includes(q) || row.description.toLowerCase().includes(q);
            });
        }

        return {
            data: rows,
            page,
            limit,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / limit),
        };
    }
}