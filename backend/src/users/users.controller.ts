import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {Roles} from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser('user_id') userId: number,
  ) {
    return this.usersService.createUser(dto, userId);
  }

  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch(':id')
  async editUser(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser('user_id') userId: number,
  ): Promise<any> {
    return this.usersService.editUser(dto, id, userId);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return this.usersService.checkUsername(username);
  }

  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(':id')
  async getUser(@Param('id') id: number) {
    return this.usersService.getUser(id);
  }
}
