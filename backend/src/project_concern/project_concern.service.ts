import { Injectable } from '@nestjs/common';
import { CreateProjectConcernDto } from './dto/create_project_concern.dto';
import { UpdateProjectConcernDto } from './dto/update_project_concern.dto';
import { supabase } from 'src/supabase/supabase.client';
import { encodeRow, decodeRows, idOf } from '../lookups/lookups';

@Injectable()
export class ProjectConcernService {

    private readonly table = 'project_concern';

    async createConcern(createProjectConcernDto: CreateProjectConcernDto, performedBy: number) {
        const payload = await encodeRow(this.table, {
            project_id: createProjectConcernDto.project_id,
            category: createProjectConcernDto.category,
            description: createProjectConcernDto.description,
            reported_by: performedBy,
        });
        const { data, error } = await supabase.from(this.table).insert([payload]).select()
            .single();
        if (error) {
            throw new Error(error.message);
        }

        await decodeRows(this.table, data);
        return { message: 'Concern reported successfully', data };
    }

    async updateConcern(id: number, updateProjectConcernDto: UpdateProjectConcernDto, performedBy: number) {
        const payload = await encodeRow(this.table, updateProjectConcernDto);
        const { data, error } = await supabase
            .from(this.table)
            .update(payload)
            .eq('project_concern_id', id)
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        await decodeRows(this.table, data);
        return { message: 'Concern updated successfully', data };
    }

    async getConcern(id: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_concern_id', id)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }
        return decodeRows(this.table, data);
    }

    async getConcernsByProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }
        return decodeRows(this.table, data);
    }


    async deleteConcern(id: number, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('project_concern_id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        await decodeRows(this.table, data);
        return { message: 'Concern deleted successfully', data };
    }
}