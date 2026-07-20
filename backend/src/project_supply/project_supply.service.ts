import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';

@Injectable()
export class ProjectSupplyService {
    private readonly table = 'project_supply';

    async createSupply(dto: CreateSupplyDto, performedBy: number) {
        const { data, error } = await supabase.from(this.table).insert([dto]).select().single();
        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_supply_id,
            action: 'CREATE',
        });

        return { message: 'Supply added successfully', data };
    }

    async updateSupply(id: number, dto: UpdateSupplyDto, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update(dto)
            .eq('project_supply_id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_supply_id,
            action: 'UPDATE',
        });

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

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.project_supply_id,
            action: 'DELETE',
        });

        return { message: 'Supply deleted successfully' };
    }

    async getSuppliesForProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null);
        if (error) throw new Error(error.message);
        return data;
    }
}