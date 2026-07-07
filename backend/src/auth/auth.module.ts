import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolesController } from '../roles/roles.controller';
import { RolesService } from '../roles/roles.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule,
    UsersModule,
  ],
  controllers: [AuthController, RolesController],
  providers: [AuthService, RolesService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}