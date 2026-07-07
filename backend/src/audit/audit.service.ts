import { Inject, Injectable } from '@nestjs/common';
import {supabase} from '../supabase/supabase.client';
@Injectable()
export class AuditService {

    async createLog(
        userId:number,
        affectedId:number,
        action:'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
        tableName?:string,
        
    ){
        const {data, error} = await supabase
        .from('logs')
        .insert({
            user_id: userId,
            table_name: tableName,
            affected_id: affectedId,
            action: action,
        });
    }
}
