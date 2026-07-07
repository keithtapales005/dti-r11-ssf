import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response,Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
@HttpCode(200)
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.login(dto);

  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: result.expires_in * 1000,
  });

  return { message: 'Login successful' };
}
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token',{
      httpOnly: true,
      secure:true,
      sameSite:'strict',
    });
    return { message: 'Logout successful' };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
