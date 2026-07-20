import { Injectable } from '@nestjs/common';
import { CreateProjectDocumentChecklistDto } from './dto/create_project_document_checklist.dto';
import { UpdateProjectDocumentChecklistDto } from './dto/update_project_document_checklist.dto';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class ProjectDocumentChecklistService {

    private readonly table = 'project_document_checklist';

    async createChecklistItem(dto: CreateProjectDocumentChecklistDto, performedBy: number) {
        const { data, error } = await supabase.from(this.table).insert([
            {
                project_id: dto.project_id,
                document_name: dto.document_name,
                status: dto.status || 'Pending',
            },
        ]).select()
        .single();
        if (error) {
            throw new Error(error.message);
        }

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.checklist_id,
            action: 'CREATE',
        });

        return { message: 'Checklist item added successfully' };
    }

    async updateChecklistItem(id: string, dto: UpdateProjectDocumentChecklistDto, performedBy: number) {
        const updatePayload: any = { ...dto, updated_at: new Date().toISOString() };

        if (dto.status === 'Verified') {
            updatePayload.verified_by = performedBy;
        }

        const { data, error } = await supabase
        .from(this.table)
        .update(updatePayload)
        .eq('checklist_id', id)
        .select()
        .single();
        if (error) {
            throw new Error(error.message);
        }
        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.checklist_id,
            action: 'UPDATE',
        });
        return { message: 'Checklist item updated successfully' };
    }

    async getChecklistByProject(projectId: number) {
        const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        const total = data.length;
        const verifiedCount = data.filter((item) => item.status === 'Verified').length;
        const progressPercentage = total === 0 ? 0 : Math.round((verifiedCount / total) * 100);

        return {
            items: data,
            total,
            verifiedCount,
            progressPercentage,
        };
    }

    async deleteChecklistItem(id: string, performedBy: number) {
        const { data, error } = await supabase
        .from(this.table)
        .delete()
        .eq('checklist_id', id)
        .select()
        .single();

        if (error) {
            throw new Error(error.message);
        }

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: id,
            action: 'DELETE',
        });

        return { message: 'Checklist item deleted successfully' };
    }
}