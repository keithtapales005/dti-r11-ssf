// src/auth/guards/roles.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class RolesGuard implements CanActivate {
  private supabase;

  constructor(private reflector: Reflector) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      );
    }

    this.supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(
        'roles',
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    // JWT guard should have already populated request.user
    const jwtUser = request.user;

    if (!jwtUser) {
      throw new UnauthorizedException(
        'Authentication required.',
      );
    }

    // use the id from JWT, not headers
    const userId =
      jwtUser.sub ??
      jwtUser.user_id ??
      jwtUser.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User identifier missing from token.',
      );
    }

    // fetch CURRENT role from database
    const { data: userData, error } =
      await this.supabase
        .from('users')
        .select(`
          user_id,
          username,
          user_status_id,
          role_id!inner (
            role_id,
            role_name
          )
        `)
        .eq('user_id', userId)
        .single();

    if (error || !userData) {
      throw new ForbiddenException(
        'User not found.',
      );
    } if (userData.user_status_id !== 1) {
    if (userData.user_status_id === 2) {
      throw new ForbiddenException('Account is blocked.');
    }

    if (userData.user_status_id === 3) {
      throw new ForbiddenException('Account is deleted.');
    }

    throw new ForbiddenException('Account is inactive.');
  }

    const role =
      userData.role_id as {
        role_id: number;
        role_name: string;
      };

    if (!role?.role_name) {
      throw new ForbiddenException(
        'User has no role assigned.',
      );
    }

    const currentRole =
      role.role_name.toUpperCase();

    const allowedRoles =
      requiredRoles.map((r) =>
        r.toUpperCase(),
      );

    const hasPermission =
      allowedRoles.includes(currentRole);

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions.',
      );
    }

    // attach fresh DB data
    request.user = {
      ...jwtUser,
      dbUser: userData,
      role: role.role_name,
      roleId: role.role_id,
    };

    return true;
  }
}