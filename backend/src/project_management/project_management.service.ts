import { Injectable } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CreateProjectDto}  from './dto/create-project.dto';
import { supabase } from 'src/supabase/supabase.client';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
@Injectable()
export class ProjectManagementService {

    private readonly table = 'project';
    async createProject(createProjectDto: CreateProjectDto, performedBy: number) {
        const { data, error } = await supabase.from(this.table).insert([
            {
                province_id: createProjectDto.province_id,
                created_by: createProjectDto.created_by,
                project_status_id: createProjectDto.project_status_id,
                ssf_number: createProjectDto.ssf_number,
                business_name: createProjectDto.business_name,
                project_title: createProjectDto.project_title,
                year_launched: createProjectDto.year_launched,
                date_established: createProjectDto.date_established,
                industry: createProjectDto.industry,
                project_cost: createProjectDto.project_cost,
            },
        ]).select()
        .single();
        if (error) {
            throw new Error(error.message);
        }

            await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.province_id,
            action: 'CREATE',
            });

        return { message: 'Project created successfully' };
    }
    async updateProject(Id: number, updateProjectDto: CreateProjectDto, performedBy: number) {
        const { data, error } = await supabase
        .from(this.table)
        .update(updateProjectDto)
        .eq('project_id', Id)
        .select()
        .single();
        if (error) {
            throw new Error(error.message);
        }
        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_id,
            action: 'UPDATE'
        });
        return { message: 'Project updated successfully' };
    }
    async getProject(Id: number) {
        const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('project_id', Id)
        .maybeSingle();
        
        if (error) {
            throw new Error(error.message)
            
        }
        return data;
    }
    async getAllProjects(page: number, limit: number) {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        const { data, error, count } = await supabase
        .from(this.table)
        .select('*', {count: 'exact'})
        .range(from, to);
        if (error) {
            throw new Error(error.message);
        }
        return { data,page,limit,total:count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) };
    }
    
}