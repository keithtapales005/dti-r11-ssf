import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreateLookupDto, UpdateLookupDto } from './dto/lookup.dto';
import {
  LOOKUPS,
  LookupRow,
  createLookupValue,
  getDef,
  getLookupRows,
  insertLog,
  invalidateLookup,
} from './lookups';

@Injectable()
export class LookupsService {
  /** The lists the Manage Lists page can show. */
  getLists() {
    return Object.values(LOOKUPS)
      .filter((d) => d.managed)
      .map((d) => ({ key: d.key, label: d.label }));
  }

  private assertManaged(list: string) {
    const d = getDef(list);
    if (!d.managed) throw new BadRequestException(`"${d.label}" cannot be edited.`);
    return d;
  }

  async getValues(list: string, includeInactive: boolean): Promise<LookupRow[]> {
    getDef(list);
    const rows = await getLookupRows(list, true);
    return includeInactive ? rows : rows.filter((r) => r.is_active);
  }

  async create(list: string, dto: CreateLookupDto, userId: number) {
    const d = this.assertManaged(list);
    const name = dto.name.trim();
    const rows = await getLookupRows(list, true);
    if (rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      throw new ConflictException(`"${name}" already exists in ${d.label}.`);
    }
    const created = await createLookupValue(list, name);
    await insertLog({ user_id: userId, table_name: d.table, affected_id: created.id, action: 'CREATE' });
    return { message: `${d.label} added`, data: created };
  }

  async update(list: string, id: number, dto: UpdateLookupDto, userId: number) {
    const d = this.assertManaged(list);
    const rows = await getLookupRows(list, true);
    const current = rows.find((r) => r.id === id);
    if (!current) throw new NotFoundException(`${d.label} #${id} not found.`);

    const patch: Record<string, any> = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== current.name) {
        if (current.is_system) {
          throw new BadRequestException(`"${current.name}" is built in and cannot be renamed.`);
        }
        if (rows.some((r) => r.id !== id && r.name.toLowerCase() === name.toLowerCase())) {
          throw new ConflictException(`"${name}" already exists in ${d.label}.`);
        }
        patch[d.nameCol] = name;
      }
    }
    if (dto.is_active !== undefined && dto.is_active !== current.is_active) {
      if (current.is_system && !dto.is_active) {
        throw new BadRequestException(`"${current.name}" is built in and cannot be deactivated.`);
      }
      patch.is_active = dto.is_active;
    }
    if (dto.sort_order !== undefined) patch.sort_order = dto.sort_order;

    if (Object.keys(patch).length === 0) return { message: 'Nothing to change', data: current };

    const { error } = await supabase.from(d.table).update(patch).eq(d.idCol, id);
    if (error) {
      if ((error as any).code === '23505') throw new ConflictException(`That name already exists in ${d.label}.`);
      throw new Error(error.message);
    }
    invalidateLookup(list);
    await insertLog({ user_id: userId, table_name: d.table, affected_id: id, action: 'UPDATE' });
    const updated = (await getLookupRows(list, true)).find((r) => r.id === id);
    return { message: `${d.label} updated`, data: updated };
  }

  /** Only values that were never used can be removed; otherwise deactivate them. */
  async remove(list: string, id: number, userId: number) {
    const d = this.assertManaged(list);
    const rows = await getLookupRows(list, true);
    const current = rows.find((r) => r.id === id);
    if (!current) throw new NotFoundException(`${d.label} #${id} not found.`);
    if (current.is_system) {
      throw new BadRequestException(`"${current.name}" is built in and cannot be deleted.`);
    }

    const { error } = await supabase.from(d.table).delete().eq(d.idCol, id);
    if (error) {
      if ((error as any).code === '23503') {
        throw new ConflictException(`"${current.name}" is already used by existing records. Deactivate it instead.`);
      }
      throw new Error(error.message);
    }
    invalidateLookup(list);
    await insertLog({ user_id: userId, table_name: d.table, affected_id: id, action: 'DELETE' });
    return { message: `${d.label} deleted` };
  }
}
