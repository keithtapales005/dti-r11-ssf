import { Module } from '@nestjs/common';
import { ProjectStatusService } from './project_status.service';
import { ProjectStatusController } from './project_status.controller';

@Module({
  providers: [ProjectStatusService],
  controllers: [ProjectStatusController]
})
export class ProjectStatusModule {}
