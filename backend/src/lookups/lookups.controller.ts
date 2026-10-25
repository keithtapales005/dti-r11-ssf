import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enum/role.enum';
import { CreateLookupDto, UpdateLookupDto } from './dto/lookup.dto';
import { LookupsService } from './lookups.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  // every signed-in user: the dropdowns on the website read from here
  @Get()
  getLists() {
    return this.lookupsService.getLists();
  }

  @Get(':list')
  getValues(@Param('list') list: string, @Query('includeInactive') includeInactive?: string) {
    return this.lookupsService.getValues(list, includeInactive === 'true');
  }

  @Roles(Role.SUPERADMIN)
  @Post(':list')
  create(@Param('list') list: string, @Body() dto: CreateLookupDto, @CurrentUser('user_id') userId: number) {
    return this.lookupsService.create(list, dto, userId);
  }

  @Roles(Role.SUPERADMIN)
  @Patch(':list/:id')
  update(
    @Param('list') list: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookupDto,
    @CurrentUser('user_id') userId: number,
  ) {
    return this.lookupsService.update(list, id, dto, userId);
  }

  @Roles(Role.SUPERADMIN)
  @Delete(':list/:id')
  remove(
    @Param('list') list: string,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('user_id') userId: number,
  ) {
    return this.lookupsService.remove(list, id, userId);
  }
}
