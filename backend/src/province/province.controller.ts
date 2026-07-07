import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getAllProvinces() {
    return this.provinceService.getAllProvinces();
  }

  @Get('/:id')
  async getProvince(@Param('id') id: string) {
    return this.provinceService.getProvince(Number(id));
  }
}
