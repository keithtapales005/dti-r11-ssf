import { Module } from '@nestjs/common';
import{ProjectManagementController} from './project_management.controller';
import { ProjectManagementService } from './project_management.service';

@Module({
      controllers: [ProjectManagementController],
      providers: [ProjectManagementService],
    })

export class ProjectManagementModule {}

    

