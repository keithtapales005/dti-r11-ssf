import { Module } from '@nestjs/common';
import { ApprovedProjectService } from './approved-project.service';
import { ApprovedProjectController } from './approved-project.controller';

@Module({
  providers: [ApprovedProjectService],
  controllers: [ApprovedProjectController]
})
export class ApprovedProjectModule {}
