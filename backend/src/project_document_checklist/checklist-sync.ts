import { supabase } from '../supabase/supabase.client';
import { idOf } from '../lookups/lookups';

const TABLE = 'project_document_checklist';

/**
 * Every project has one checklist row per required, active document type.
 * Creates the missing ones (a new project, or a document type added later).
 */
export async function ensureChecklist(projectId: number): Promise<void> {
  const { data: types, error } = await supabase
    .from('document_type')
    .select('document_type_id')
    .eq('is_required', true)
    .eq('is_active', true);
  if (error) throw new Error(error.message);

  const { data: rows, error: rowsError } = await supabase
    .from(TABLE)
    .select('document_type_id')
    .eq('project_id', projectId);
  if (rowsError) throw new Error(rowsError.message);

  const have = new Set((rows ?? []).map((r: any) => r.document_type_id));
  const missing = (types ?? []).filter((t: any) => !have.has(t.document_type_id));
  if (missing.length === 0) return;

  // a document that already has a file starts as Uploaded
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('document_type_id')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .not('document_type_id', 'is', null);
  if (filesError) throw new Error(filesError.message);
  const withFiles = new Set((files ?? []).map((f: any) => f.document_type_id));

  const pending = await idOf('checklist_status', 'Pending');
  const uploaded = await idOf('checklist_status', 'Uploaded');

  const { error: insertError } = await supabase.from(TABLE).upsert(
    missing.map((t: any) => ({
      project_id: projectId,
      document_type_id: t.document_type_id,
      status_id: withFiles.has(t.document_type_id) ? uploaded : pending,
    })),
    { onConflict: 'project_id,document_type_id', ignoreDuplicates: true },
  );
  if (insertError) throw new Error(insertError.message);
}

/**
 * Call after a file is added to or removed from a document:
 *   no files left            -> Pending
 *   has files (was Pending)  -> Uploaded
 *   has files (was Verified) -> Uploaded again, so it has to be re-verified
 * Never throws: a failed sync must not fail the upload or the delete itself.
 */
export async function syncDocumentStatus(projectId: number, documentTypeId?: number | null): Promise<void> {
  if (!documentTypeId) return;
  try {
    await ensureChecklist(projectId);

    const { count, error: countError } = await supabase
      .from('files')
      .select('file_id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('document_type_id', documentTypeId)
      .is('deleted_at', null);
    if (countError) throw new Error(countError.message);

    const { data: row, error } = await supabase
      .from(TABLE)
      .select('checklist_id, status_id')
      .eq('project_id', projectId)
      .eq('document_type_id', documentTypeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return; // not a required document

    const target = await idOf('checklist_status', count && count > 0 ? 'Uploaded' : 'Pending');
    if (row.status_id === target) return;

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({ status_id: target, verified_by: null, updated_at: new Date().toISOString() })
      .eq('checklist_id', row.checklist_id);
    if (updateError) throw new Error(updateError.message);
  } catch (err) {
    console.error('syncDocumentStatus failed:', (err as Error).message);
  }
}
