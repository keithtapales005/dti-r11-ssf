import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'SELF_REGISTER'
    | 'APPROVE'
    | 'REJECT';

@Injectable()
export class AuditService {
    async createLog(
        userId: number,
        affectedId: number,
        action: AuditAction,
        tableName?: string,
    ) {
        const { error } = await supabase.from('logs').insert({
            user_id: userId,
            table_name: tableName,
            affected_id: affectedId,
            action,
        });

        if (error) {
            console.error('Audit log insert failed:', error);
        }
    }
}