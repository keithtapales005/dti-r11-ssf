import { Controller, Get, Param,UseGuards} from '@nestjs/common';
import { ProjectStatusService } from './project_status.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('project-status')
export class ProjectStatusController {
  constructor(private readonly projectStatusService: ProjectStatusService) {}

  @Get()
  getAllProjectStatuses() {
    return this.projectStatusService.getAllProjectStatuses();
  }
  @Get(':id')
  getProjectStatus(@Param('id')id: number) {
    return this.projectStatusService.getProjectStatus(id);
  }
}

