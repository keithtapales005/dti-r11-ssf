import { Module } from '@nestjs/common';
import { ProjectConcernController } from './project_concern.controller';
import { ProjectConcernService } from './project_concern.service';

@Module({
    controllers: [ProjectConcernController],
    providers: [ProjectConcernService],
})

export class ProjectConcernModule { }