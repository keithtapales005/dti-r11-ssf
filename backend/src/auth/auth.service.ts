import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload';
import { supabase } from '../supabase/supabase.client';

export interface AuthUser {
  user_id: number;
  username: string;
  role_id: number;
  department_id: number;
}   

export interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getJwtExpirationSeconds(): number {
    const rawValue = this.configService.get<string>('JWT_EXPIRATION');
    const value = rawValue ? Number(rawValue) : 3600;
    return Number.isFinite(value) && value > 0 ? value : 3600;
  }

  async validateUser(username: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.getUserByUsernameForAuth(username);

    console.log('Username entered:', username);
    console.log('User found:', user);

    if (!user?.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if(user.user_status_id !== 1) 
      throw new UnauthorizedException('User is not active');
    
    return {
      user_id: user.user_id,
      username: user.username,
      role_id: user.role_id,
      department_id: user.department_id,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.username, dto.password);

    const payload: JwtPayload = {
      sub: user.user_id,
      username: user.username,
      role_id: user.role_id,
      department_id: user.department_id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

        await supabase.from('logs').insert({
          user_id: user.user_id,
          affected_id: user.user_id,
          action: 'LOGIN',
        });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.getJwtExpirationSeconds(),
      user,
    };
  }
}
