import { Module } from '@nestjs/common';
import { ProjectAccomplishmentController } from './project_accomplishment.controller';
import { ProjectAccomplishmentService } from './project_accomplishment.service';

@Module({
      controllers: [ProjectAccomplishmentController],
      providers: [ProjectAccomplishmentService],
    })

export class ProjectAccomplishmentModule {}