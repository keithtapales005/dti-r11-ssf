import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class DocumentTypeService {
    private readonly table = 'document_type';

    async getAll() {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }
    async getProjectCompleteness(projectId: number) {
        const types = (await this.getAll()) ?? [];

        const { data: files, error } = await supabase
            .from('files')
            .select('document_type_id')
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .not('document_type_id', 'is', null);

        if (error) throw new Error(error.message);

        const counts = new Map<number, number>();
        for (const f of files ?? []) {
            counts.set(f.document_type_id, (counts.get(f.document_type_id) ?? 0) + 1);
        }

        const items = types.map((t: any) => {
            const fileCount = counts.get(t.document_type_id) ?? 0;
            return {
                document_type_id: t.document_type_id,
                name: t.name,
                is_required: t.is_required,
                file_count: fileCount,
                satisfied: fileCount > 0,
            };
        });

        const required = items.filter((i) => i.is_required);
        const missing = required.filter((i) => !i.satisfied).map((i) => i.name);

        return {
            project_id: projectId,
            required_total: required.length,
            required_satisfied: required.length - missing.length,
            missing,
            is_complete: missing.length === 0,
            items,
        };
    }
}