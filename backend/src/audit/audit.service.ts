import { Injectable } from '@nestjs/common';
import { insertLog } from '../lookups/lookups';

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
        const { error } = await insertLog({
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
