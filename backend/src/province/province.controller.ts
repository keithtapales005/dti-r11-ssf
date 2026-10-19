import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  // Public: the register page needs this before anyone is logged in
  @Get()
  async getAllProvinces() {
    return this.provinceService.getAllProvinces();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getProvince(@Param('id') id: string) {
    return this.provinceService.getProvince(Number(id));
  }
}