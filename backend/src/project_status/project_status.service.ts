import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
@Injectable()
export class ProjectStatusService {
    async getProjectStatus(projectId: number) {
        const {data , error} = await supabase
        .from('project_status')
        .select('*')
        .eq('project_status_id', projectId)
        .maybeSingle();

        if (error){
            throw new Error(error.message)
        }
        if (!data) {
            throw new Error('Project status not found');
        }
        return data;
    }
    async getAllProjectStatuses() {
        const {data , error} = await supabase
        .from('project_status')
        .select('*');
        if (error){
            throw new Error(error.message);
        }
        return data;
    }
}
