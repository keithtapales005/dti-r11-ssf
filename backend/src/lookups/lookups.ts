import { BadRequestException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

/**
 * Fixed-value fields (categories, statuses, units, ...) are stored in the database as a
 * small number (smallint) pointing at a lookup table. This file is the only place that
 * knows how to turn that number into text and back, so the API and the website keep
 * sending and receiving plain text such as "Grievance".
 */

export interface LookupDef {
  key: string;
  label: string;
  table: string;
  idCol: string;
  nameCol: string;
  /** shown on the Manage Lists page (editable by the Superadmin) */
  managed: boolean;
  /** a value that does not exist yet is created automatically when it is saved */
  openEnded?: boolean;
}

const def = (
  key: string,
  label: string,
  managed: boolean,
  opts: Partial<LookupDef> = {},
): LookupDef => ({
  key,
  label,
  table: key,
  idCol: `${key}_id`,
  nameCol: 'name',
  managed,
  ...opts,
});

export const LOOKUPS: Record<string, LookupDef> = {
  project_status: def('project_status', 'Project Status', true, { nameCol: 'status_name' }),
  user_status: def('user_status', 'Account Status', true, { nameCol: 'user_status_name' }),
  concern_category: def('concern_category', 'Concern Category', true),
  operational_status: def('operational_status', 'Operational Status', true),
  accomplishment_category: def('accomplishment_category', 'Accomplishment Category', true),
  checklist_status: def('checklist_status', 'Checklist Status', false), // set automatically from uploads
  fund_source: def('fund_source', 'Fund Source', true, { openEnded: true }),
  supply_unit: def('supply_unit', 'Supply Unit', true, { openEnded: true }),
  // internal lists: never edited by hand
  log_action: def('log_action', 'Log Action', false),
  record_table: def('record_table', 'Record Table', false, { openEnded: true }),
  notification_type: def('notification_type', 'Notification Type', false),
  file_type: def('file_type', 'File Type', false, { openEnded: true }),
};

export interface LookupRow {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
}

// ------------------------------------------------------------------ cache
const TTL_MS = 60_000;
const cache = new Map<string, { at: number; rows: LookupRow[] }>();

export function getDef(list: string): LookupDef {
  const d = LOOKUPS[list];
  if (!d) throw new BadRequestException(`Unknown list "${list}".`);
  return d;
}

export function invalidateLookup(list?: string) {
  if (list) cache.delete(list);
  else cache.clear();
}

export async function getLookupRows(list: string, fresh = false): Promise<LookupRow[]> {
  const d = getDef(list);
  const hit = cache.get(list);
  if (!fresh && hit && Date.now() - hit.at < TTL_MS) return hit.rows;

  const { data, error } = await supabase.from(d.table).select('*');
  if (error) throw new Error(error.message);

  const rows: LookupRow[] = (data ?? [])
    .map((r: any) => ({
      id: Number(r[d.idCol]),
      name: String(r[d.nameCol] ?? ''),
      sort_order: Number(r.sort_order ?? 0),
      is_active: r.is_active ?? true,
      is_system: r.is_system ?? false,
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  cache.set(list, { at: Date.now(), rows });
  return rows;
}

const norm = (s: string) => s.trim().toLowerCase();

export async function createLookupValue(list: string, name: string): Promise<LookupRow> {
  const d = getDef(list);
  const clean = name.trim();
  const rows = await getLookupRows(list, true);
  const nextOrder = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1;

  const payload: Record<string, any> = { [d.nameCol]: clean, sort_order: nextOrder };
  const { data, error } = await supabase.from(d.table).insert(payload).select('*').single();

  if (error) {
    if ((error as any).code === '23505') {
      // somebody created it a moment ago: use that one
      const again = (await getLookupRows(list, true)).find((r) => norm(r.name) === norm(clean));
      if (again) return again;
    }
    throw new Error(error.message);
  }
  invalidateLookup(list);
  return {
    id: Number(data[d.idCol]),
    name: String(data[d.nameCol]),
    sort_order: Number(data.sort_order ?? 0),
    is_active: data.is_active ?? true,
    is_system: data.is_system ?? false,
  };
}

/**
 * Text -> code. Unknown or deactivated values are rejected, unless the list is
 * "open ended" (fund source, unit, ...), where a new value is created on the fly.
 */
export async function idOf(list: string, label: string): Promise<number> {
  const d = getDef(list);
  const clean = String(label ?? '').trim();
  if (!clean) throw new BadRequestException(`A value is required for ${d.label}.`);

  const rows = await getLookupRows(list);
  const found = rows.find((r) => norm(r.name) === norm(clean));
  if (found) {
    if (!found.is_active && !d.openEnded) {
      throw new BadRequestException(`"${found.name}" is no longer available for ${d.label}.`);
    }
    return found.id;
  }
  if (d.openEnded) return (await createLookupValue(list, clean)).id;

  const allowed = rows.filter((r) => r.is_active).map((r) => r.name).join(', ');
  throw new BadRequestException(`Invalid ${d.label}: "${clean}". Allowed values: ${allowed}.`);
}

/** Code -> text. Deactivated values still resolve, so old records stay readable. */
export async function labelOf(list: string, id: number | null | undefined): Promise<string | null> {
  if (id === null || id === undefined) return null;
  const rows = await getLookupRows(list);
  return rows.find((r) => r.id === Number(id))?.name ?? null;
}

// ------------------------------------------------------------------ row codec
interface ColumnMap {
  column: string; // column in the table, e.g. category_id
  field: string; // name used by the API / website, e.g. category
  list: string;
}

const COLUMNS: Record<string, ColumnMap[]> = {
  project_concern: [{ column: 'category_id', field: 'category', list: 'concern_category' }],
  project_accomplishment: [
    { column: 'operational_status_id', field: 'operational_status', list: 'operational_status' },
    { column: 'accomplishment_category_id', field: 'accomplishment_category', list: 'accomplishment_category' },
    { column: 'fund_source_id', field: 'fund_source', list: 'fund_source' },
  ],
  project_document_checklist: [{ column: 'status_id', field: 'status', list: 'checklist_status' }],
  project_supply: [{ column: 'unit_id', field: 'unit', list: 'supply_unit' }],
  files: [{ column: 'file_type_id', field: 'file_type', list: 'file_type' }],
  logs: [
    { column: 'action_id', field: 'action', list: 'log_action' },
    { column: 'table_id', field: 'table_name', list: 'record_table' },
  ],
  notifications: [
    { column: 'type_id', field: 'type', list: 'notification_type' },
    { column: 'reference_table_id', field: 'reference_table', list: 'record_table' },
  ],
};

/** Replace text fields in a payload with their codes (call before insert / update). */
export async function encodeRow<T extends Record<string, any>>(table: string, payload: T): Promise<Record<string, any>> {
  const out: Record<string, any> = { ...payload };
  for (const m of COLUMNS[table] ?? []) {
    if (!(m.field in out)) continue;
    const value = out[m.field];
    delete out[m.field];
    if (value === null || value === undefined || String(value).trim() === '') {
      out[m.column] = null;
    } else {
      out[m.column] = await idOf(m.list, String(value));
    }
  }
  return out;
}

/** Replace codes in rows read from the database with their text. */
export async function decodeRows<T = any>(table: string, data: T): Promise<T> {
  const maps = COLUMNS[table];
  if (!maps || data === null || data === undefined) return data;

  const rows: any[] = Array.isArray(data) ? data : [data];
  for (const m of maps) {
    if (!rows.some((r) => r && m.column in r)) continue;
    const list = await getLookupRows(m.list);
    const byId = new Map(list.map((r) => [r.id, r.name]));
    for (const r of rows) {
      if (!r || !(m.column in r)) continue;
      r[m.field] = r[m.column] === null ? null : byId.get(Number(r[m.column])) ?? null;
      delete r[m.column];
    }
  }
  return data;
}

// ------------------------------------------------------------------ audit log
export interface LogRow {
  user_id?: number | null;
  table_name?: string | null;
  affected_id?: number | null;
  action: string;
}

/** Same shape the services always used, now stored as codes. Never throws. */
export async function insertLog(row: LogRow): Promise<{ error: any }> {
  try {
    const { error } = await supabase.from('logs').insert({
      user_id: row.user_id ?? null,
      affected_id: row.affected_id === undefined || row.affected_id === null ? null : Number(row.affected_id),
      action_id: await idOf('log_action', row.action),
      table_id: row.table_name ? await idOf('record_table', row.table_name) : null,
    });
    return { error };
  } catch (error) {
    return { error };
  }
}
