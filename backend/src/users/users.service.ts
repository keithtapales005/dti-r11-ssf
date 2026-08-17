import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './types/user.type';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  private readonly table = 'users';
  private readonly PENDING_VERIFICATION_STATUS_ID = 4;
  private readonly DEFAULT_ROLE_ID = 3;

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

  async registerUser(dto: RegisterDto) {
    const result = await this.checkUsername(dto.username);
    if (!result.available) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { data, error } = await supabase.from(this.table).insert([
      {
        username: dto.username,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: passwordHash,
        role_id: this.DEFAULT_ROLE_ID,
        department_id: 10,
        user_status_id: this.PENDING_VERIFICATION_STATUS_ID,
      },
    ]).select().single();

    if (error) {
      throw new Error(error.message);
    }


    const { error: logError } = await supabase.from('logs').insert({
      user_id: data.user_id,
      table_name: this.table,
      affected_id: data.user_id,
      action: 'SELF_REGISTER',
    });

    if (logError) {
      console.error('Failed to insert log:', logError);
    }

    return { message: 'Registration submitted. Your account is pending superadmin approval.' };
  }

  async getPendingUsers() {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        'user_id, username, first_name, last_name, role_id, department_id, user_status_id, created_at',
      )
      .eq('user_status_id', 4); // Pending Verification

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async approveUser(
    userId: number,
    dto: { role_id: number; department_id: number },
    performedBy: number,
  ) {
    const ALLOWED_APPROVAL_ROLES = [2, 3]; // Admin, Viewer only — never Superadmin

    if (!ALLOWED_APPROVAL_ROLES.includes(dto.role_id)) {
      throw new ForbiddenException('Cannot assign Superadmin role during approval');
    }

    const { data, error } = await supabase
      .from(this.table)
      .update({
        user_status_id: 1, // Active
        role_id: dto.role_id,
        department_id: dto.department_id,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('logs').insert({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'APPROVE',
    });

    return { message: 'User approved successfully', user: data };
  }

  async rejectUser(userId: number, performedBy: number) {
    const { data, error } = await supabase
      .from(this.table)
      .update({ user_status_id: 2 }) // Blocked
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('logs').insert({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'REJECT',
    });

    return { message: 'User rejected', user: data };
  }

  async deleteUser(userId: number, performedBy: number) {
    const anonymizedHash = await bcrypt.hash(
      `deleted-${userId}-${Date.now()}`,
      10,
    );

    const { error } = await supabase
      .from(this.table)
      .update({
        username: `deleted_user_${userId}`,
        first_name: 'Deleted',
        last_name: 'User',
        password_hash: anonymizedHash,
        department_id: null,
        user_status_id: 3, // Deleted
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('logs').insert({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'DELETE',
    });

    return { message: 'User anonymized and marked as deleted' };
  }

}


