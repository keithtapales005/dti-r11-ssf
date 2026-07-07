import { Controller, Get, Param,UseGuards } from '@nestjs/common';
import { StatusTypeService } from './status-type.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('status-type')
export class StatusTypeController {
  constructor(private readonly statusTypeService: StatusTypeService) {}

  @Get()
  async getAllStatusTypes() {
    return this.statusTypeService.getAllStatusTypes();
  }

  @Get(':id')
  async getStatusType(@Param('id') id: string) {
    return this.statusTypeService.getStatusType(Number(id));
  }
}
