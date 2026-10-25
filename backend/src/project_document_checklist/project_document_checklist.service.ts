import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProjectDocumentChecklistDto } from './dto/update_project_document_checklist.dto';
import { supabase } from 'src/supabase/supabase.client';
import { decodeRows, idOf, insertLog } from '../lookups/lookups';
import { ensureChecklist } from './checklist-sync';

@Injectable()
export class ProjectDocumentChecklistService {

    private readonly table = 'project_document_checklist';

    /** Verify a document, or take the verification back. Everything else is automatic. */
    async updateChecklistItem(id: number, dto: UpdateProjectDocumentChecklistDto, performedBy: number) {
        const { data: row, error: rowError } = await supabase
            .from(this.table)
            .select('checklist_id, project_id, document_type_id')
            .eq('checklist_id', id)
            .maybeSingle();
        if (rowError) throw new Error(rowError.message);
        if (!row) throw new NotFoundException('Checklist item not found');

        const status = dto.status.trim();
        if (status.toLowerCase() === 'pending') {
            throw new BadRequestException('A document goes back to Pending by itself when its last file is removed.');
        }

        const { count, error: countError } = await supabase
            .from('files')
            .select('file_id', { count: 'exact', head: true })
            .eq('project_id', row.project_id)
            .eq('document_type_id', row.document_type_id)
            .is('deleted_at', null);
        if (countError) throw new Error(countError.message);
        if (!count) {
            throw new BadRequestException('Upload a file for this document before changing its status.');
        }

        const statusId = await idOf('checklist_status', status);
        const verifiedId = await idOf('checklist_status', 'Verified');

        const { data, error } = await supabase
            .from(this.table)
            .update({
                status_id: statusId,
                verified_by: statusId === verifiedId ? performedBy : null,
                updated_at: new Date().toISOString(),
            })
            .eq('checklist_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);

        await insertLog({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.checklist_id,
            action: 'UPDATE',
        });
        return { message: 'Checklist item updated successfully' };
    }

    async getChecklistByProject(projectId: number) {
        await ensureChecklist(projectId);

        const { data, error } = await supabase
            .from(this.table)
            .select('*, document_type!inner(name, sort_order, is_required, is_active)')
            .eq('project_id', projectId)
            .eq('document_type.is_required', true)
            .eq('document_type.is_active', true);
        if (error) throw new Error(error.message);

        const rows: any[] = data ?? [];
        await decodeRows(this.table, rows);

        const items = rows
            .map((r) => ({
                checklist_id: r.checklist_id,
                project_id: r.project_id,
                document_type_id: r.document_type_id,
                document_name: r.document_type?.name ?? '',
                sort_order: r.document_type?.sort_order ?? 0,
                status: r.status as string,
                verified_by: r.verified_by,
                created_at: r.created_at,
                updated_at: r.updated_at,
            }))
            .sort((a, b) => a.sort_order - b.sort_order || a.checklist_id - b.checklist_id);

        const total = items.length;
        const verifiedCount = items.filter((i) => i.status === 'Verified').length;
        return {
            items,
            total,
            verifiedCount,
            progressPercentage: total === 0 ? 0 : Math.round((verifiedCount / total) * 100),
        };
    }
}
