import { MailService } from '../mail/mail.service';
import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './types/user.type';
import { ConflictException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { insertLog } from '../lookups/lookups';

@Injectable()
export class UsersService {
  private readonly table = 'users';
  private readonly PENDING_VERIFICATION_STATUS_ID = 4;
  private readonly DEFAULT_ROLE_ID = 3;
  private readonly SUPERADMIN_ROLE_ID = 1;
  private readonly ACTIVE_STATUS_ID = 1;
  private readonly REGIONAL_OFFICE_DEPARTMENT_ID = 1;
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) { }

  private async countActiveSuperadmins(): Promise<number> {
    const { count, error } = await supabase
      .from(this.table)
      .select('user_id', { count: 'exact', head: true })
      .eq('role_id', this.SUPERADMIN_ROLE_ID)
      .eq('user_status_id', this.ACTIVE_STATUS_ID);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  private async assertNotLastActiveSuperadmin(userId: number) {
    const target = await this.getUser(userId);
    if (!target) throw new NotFoundException('User not found');
    const isActiveSuperadmin =
      target.role_id === this.SUPERADMIN_ROLE_ID &&
      target.user_status_id === this.ACTIVE_STATUS_ID;
    if (isActiveSuperadmin && (await this.countActiveSuperadmins()) <= 1) {
      throw new BadRequestException(
        'You cannot demote, block, or delete the last active Superadmin.',
      );
    }
  }

  async createUser(dto: CreateUserDto, performedBy: number) {
    const result = await this.checkUsername(dto.username);
    if (!result.available) {
      throw new ConflictException('Username already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.role_id === this.SUPERADMIN_ROLE_ID) {
      throw new ForbiddenException('Superadmin can only be granted by promoting an existing user.');
    }
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

    await insertLog({
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
    const { password, ...rest } = dto;

    const current = await this.getUser(user_id);
    if (!current) throw new NotFoundException('User not found');

    const roleAfter = rest.role_id ?? current.role_id;
    const deptAfter = rest.department_id ?? current.department_id;
    const statusAfter = rest.user_status_id ?? current.user_status_id;

    const roleChanging = roleAfter !== current.role_id;
    const deptChanging = deptAfter !== current.department_id;
    const statusChanging = statusAfter !== current.user_status_id;

    // 1. No changing your own role or status
    if (user_id === performedBy && (roleChanging || statusChanging)) {
      throw new ForbiddenException('You cannot change your own role or status.');
    }

    // 2. Promotion: Active accounts only
    if (roleChanging && roleAfter === this.SUPERADMIN_ROLE_ID) {
      if (current.user_status_id !== this.ACTIVE_STATUS_ID) {
        throw new BadRequestException('Only Active accounts can be promoted.');
      }
    }

    // 3. Superadmins must be in the Regional Office (checked on the resulting state,
    //    and only when role or department is changing so existing Superadmins stay editable)
    if (
      (roleChanging || deptChanging) &&
      roleAfter === this.SUPERADMIN_ROLE_ID &&
      deptAfter !== this.REGIONAL_OFFICE_DEPARTMENT_ID
    ) {
      throw new BadRequestException(
        'Only users assigned to the Regional Office can be Superadmin.',
      );
    }

    // 4. Never leave the system without an active Superadmin
    if (
      current.role_id === this.SUPERADMIN_ROLE_ID &&
      (roleChanging || statusAfter !== this.ACTIVE_STATUS_ID)
    ) {
      await this.assertNotLastActiveSuperadmin(user_id);
    }

    const updates: Record<string, unknown> = { ...rest };
    if (password) {
      updates.password_hash = await this.hashPassword(password);
    }
    if (Object.keys(updates).length === 0) {
      return current;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updates)
      .eq('user_id', user_id)
      .select(
        'user_id, username, first_name, last_name, role_id, department_id, user_status_id',
      )
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundException('User not found');

    await insertLog({
      user_id: performedBy,
      table_name: this.table,
      affected_id: data.user_id,
      action: roleChanging ? 'ROLE_CHANGE' : 'UPDATE',
    });

    return data;
  }
  async getUser(user_id: number) {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        'user_id, username, first_name, last_name, role_id, department_id, province_id, user_status_id',
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
    const { data: existingEmail } = await supabase
      .from(this.table)
      .select('user_id')
      .eq('email', dto.email.trim().toLowerCase())
      .maybeSingle();
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }
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
        province_id: dto.province_id,
        email: dto.email.trim().toLowerCase(),
        user_status_id: this.PENDING_VERIFICATION_STATUS_ID,
      },
    ]).select().single();

    if (error) {
      throw new Error(error.message);
    }


    const { error: logError } = await insertLog({
      user_id: data.user_id,
      table_name: this.table,
      affected_id: data.user_id,
      action: 'SELF_REGISTER',
    });

    if (logError) {
      console.error('Failed to insert log:', logError);
    }
    await this.notificationsService.notifySelfRegister(data.user_id, dto.username);
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

    await insertLog({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'APPROVE',
    });

    let emailSent = false;
    if (data.email) {
      emailSent = await this.mailService.sendAccountApproved(
        data.email,
        data.first_name,
        data.username,
      );
    }

    return { message: 'User approved successfully', user: data, emailSent };
  }

  async rejectUser(
    userId: number,
    dto: { reason: string },
    performedBy: number,
  ) {
    if (userId === performedBy) {
      throw new ForbiddenException('You cannot block or delete your own account.');
    }
    await this.assertNotLastActiveSuperadmin(userId);

    const reason = dto.reason.trim();

    const { data, error } = await supabase
      .from(this.table)
      .update({ user_status_id: 2 }) // Blocked
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await insertLog({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'REJECT',
    });

    let emailSent = false;
    if (data.email) {
      emailSent = await this.mailService.sendAccountRejected(
        data.email,
        data.first_name,
        reason,
      );
    }

    return { message: 'User rejected', user: data, emailSent };
  }

  async deleteUser(userId: number, performedBy: number) {
    if (userId === performedBy) {
      throw new ForbiddenException('You cannot block or delete your own account.');
    }
    await this.assertNotLastActiveSuperadmin(userId);

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

    await insertLog({
      user_id: performedBy,
      table_name: this.table,
      affected_id: userId,
      action: 'DELETE',
    });

    return { message: 'User anonymized and marked as deleted' };
  }

}


