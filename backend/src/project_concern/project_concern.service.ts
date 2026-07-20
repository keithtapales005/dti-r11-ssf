import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';
import { CreateConcernDto } from './dto/create-concern.dto';
import { UpdateConcernDto } from './dto/update-concern.dto';

@Injectable()
export class ProjectConcernService {
    private readonly table = 'project_concern';

    async createConcern(dto: CreateConcernDto, performedBy: number) {
        const { data, error } = await supabase.from(this.table).insert([
            { ...dto, reported_by: dto.reported_by ?? performedBy },
        ]).select().single();
        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_concern_id,
            action: 'CREATE',
        });

        return { message: 'Concern logged successfully', data };
    }

    async updateConcern(id: number, dto: UpdateConcernDto, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update(dto)
            .eq('project_concern_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_concern_id,
            action: 'UPDATE',
        });

        return { message: 'Concern updated successfully', data };
    }

    async deleteConcern(id: number, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('project_concern_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_concern_id,
            action: 'DELETE',
        });

        return { message: 'Concern deleted successfully' };
    }

    async getConcernsForProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null);
        if (error) throw new Error(error.message);
        return data;
    }
}