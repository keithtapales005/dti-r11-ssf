import { Module } from '@nestjs/common';
import { ProjectSupplyController } from './project_supply.controller';
import { ProjectSupplyService } from './project_supply.service';

@Module({
    controllers: [ProjectSupplyController],
    providers: [ProjectSupplyService],
})
export class ProjectSupplyModule {}