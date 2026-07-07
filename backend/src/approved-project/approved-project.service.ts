import { Injectable } from '@nestjs/common';
import { CreateApprovedProjectDto } from './dto/create-approved-projet.dto';
import { UpdateApprovedProjectDto } from './dto/update-approved-project.dto';
import { supabase } from '../supabase/supabase.client';
@Injectable()
export class ApprovedProjectService {

    async approveProject(CreateApprovedProjectDto: CreateApprovedProjectDto) {
        const {data, error} = await supabase
        .from('approved_project')
        .insert([
            {
                project_id: CreateApprovedProjectDto.project_id,
                approved_project_stage_id: CreateApprovedProjectDto.approved_project_stage_id,
            }
        ]);
        if (error) {
            throw new Error(error.message);
        }
        return {message: 'Project approved successfully'};
    }
    async updateApprovedProject(id: number, UpdateApprovedProjectDto: UpdateApprovedProjectDto) {
        const {data, error} = await supabase
        .from('approved_project')
        .update({
            approved_project_stage_id: UpdateApprovedProjectDto.approved_project_stage_id,
            updated_at: new Date().toISOString()
        })
        .eq('approved_project_id', id);
        if (error) {
            throw new Error(error.message);
        }
        return {message: 'Project updated successfully'};
    }
    async getApprovedProject(id: number) {
        const {data, error} = await supabase
        .from('approved_project')
        .select('*')
        .eq('approved_project_id', id)
        .maybeSingle();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    async getAllApprovedProjects() {
        const {data, error} = await supabase
        .from('approved_project')
        .select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
}
