import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './types/user.type';
@Injectable()
export class UsersService {
  private readonly table = 'users';

  async createUser(dto: CreateUserDto, performedBy: number) {
    const result = await this.checkUsername(dto.username);
    if (!result.available) {
      throw new Error('Username already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { data, error } = await supabase.from(this.table).insert([
      {
        username: dto.username,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: passwordHash,
        role_id: dto.role_id,
        department_id: dto.department_id,
        user_status_id: 1,
      },
    ]).select()
    .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('logs').insert({
      user_id: performedBy,
      table_name: this.table,
      affected_id: data.user_id,
      action: 'CREATE',
    });

    return { message: 'User created succesfully' };
  }

  async checkUsername(username: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        'user_id, username, first_name, last_name, role_id, department_id',
      )
      .eq('username', username)
      .maybeSingle<User>();

    if (error) {
      throw new Error(error.message);
    }
    return {
      available: !data,
    };
  }

  async getUserByUsernameForAuth(username: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('user_id, username, password_hash, role_id, department_id, user_status_id')
      .eq('username', username)
      .maybeSingle<User>();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async editUser(dto: UpdateUserDto, user_id: number, performedBy: number) {
    const { data, error } = await supabase
      .from(this.table)
      .update({
        ...dto,
        password_hash: dto.password
          ? await this.hashPassword(dto.password)
          : undefined,
      })
      .eq('user_id', user_id)
      .select()
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    
    await supabase.from('logs').insert({
      user_id: performedBy,
      table_name: this.table,
      affected_id: data.user_id,
      action: 'UPDATE',
    });

    return data;
  }
  async getUser(user_id: number) {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        'user_id, username, first_name, last_name, role_id, department_id, user_status_id',
      )
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
  async getAllUsers() {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        'user_id, username, first_name, last_name, role_id,role(role_name), department_id,department(department_name), user_status_id,user_status(user_status_name)',
      );
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}