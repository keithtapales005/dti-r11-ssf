import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { encodeRow, decodeRows, idOf } from '../lookups/lookups';

@Injectable()
export class ProjectSupplyService {
    private readonly table = 'project_supply';

    async createSupply(dto: CreateSupplyDto, performedBy: number) {
        const payload = await encodeRow(this.table, dto);
        const { data, error } = await supabase.from(this.table).insert([payload]).select().single();
        if (error) throw new Error(error.message);
        await decodeRows(this.table, data);
        return { message: 'Supply added successfully', data };
    }

    async updateSupply(id: number, dto: UpdateSupplyDto, performedBy: number) {
        const payload = await encodeRow(this.table, dto);
        const { data, error } = await supabase
            .from(this.table)
            .update(payload)
            .eq('project_supply_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        await decodeRows(this.table, data);
        return { message: 'Supply updated successfully', data };
    }

    async deleteSupply(id: number, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('project_supply_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return { message: 'Supply deleted successfully', data };
    }

    async getSuppliesForProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null);
        if (error) throw new Error(error.message);
        return decodeRows(this.table, data);
    }
}