import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Missing JWT_SECRET in environment');
    }

    super({
  jwtFromRequest: ExtractJwt.fromExtractors([
    (request) => {
      if (!request?.cookies) {
        return null;
      }

      return request.cookies.access_token;
    },
  ]),
  ignoreExpiration: false,
  secretOrKey: secret,
});
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.getUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      department_id: user.department_id,
    };
  }
}
