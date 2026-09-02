import { Injectable } from '@nestjs/common';
import { CreateProjectConcernDto } from './dto/create_project_concern.dto';
import { UpdateProjectConcernDto } from './dto/update_project_concern.dto';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class ProjectConcernService {

    private readonly table = 'project_concern';

    async createConcern(createProjectConcernDto: CreateProjectConcernDto, performedBy: number) {
        const { data, error } = await supabase.from(this.table).insert([
            {
                project_id: createProjectConcernDto.project_id,
                category: createProjectConcernDto.category,
                description: createProjectConcernDto.description,
                reported_by: performedBy,
            },
        ]).select()
            .single();
        if (error) {
            throw new Error(error.message);
        }

        return { message: 'Concern reported successfully', data };
    }

    async updateConcern(id: number, updateProjectConcernDto: UpdateProjectConcernDto, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update(updateProjectConcernDto)
            .eq('project_concern_id', id)
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
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
        return data;
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
        return data;
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

        return { message: 'Concern deleted successfully', data };
    }
}