import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async getAllDepartments() {
    return this.departmentService.getAllDepartments();
  }

  @Get(':id')
  async getDepartment(@Param('id') id: string) {
    return this.departmentService.getDepartment(Number(id));
  }
}
