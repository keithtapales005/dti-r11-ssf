import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './types/role.type';

@Injectable()
export class RolesService {
  private readonly supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env',
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey);
  }

  async create(createRoleDto: CreateRoleDto): Promise<void> {
    const { name, description } = createRoleDto;
    await this.supabase.from('roles').insert({ name, description });
  }

  async update(updateRoleDto: UpdateRoleDto, id: string): Promise<void> {
    const { name, description } = updateRoleDto;
    await this.supabase
      .from('roles')
      .update({ name, description })
      .eq('role_id', id);
  }

  async remove(id: string): Promise<void> {
    await this.supabase.from('roles').delete().eq('role_id', id);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('role_id', id)
      .single();
    if (error) {
      throw new Error('Error finding role');
    }
    return data[0] as Role;
  }

  async findAll(): Promise<any[]> {
    const { data, error } = await this.supabase.from('roles').select('*');
    if (error) {
      throw new Error('Error finding roles');
    }
    return data as Role[];
  }
}
