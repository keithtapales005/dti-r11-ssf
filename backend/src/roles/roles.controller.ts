import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from 'src/auth/enum/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('roles') // Base endpoint route
@UseGuards(RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(Role.SUPERADMIN) // Only Superadmin can create roles
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.VIEWER)
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.VIEWER)
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(updateRoleDto, id);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
