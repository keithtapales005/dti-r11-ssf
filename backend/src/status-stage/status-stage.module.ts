import { Module } from '@nestjs/common';
import { StatusStageService } from './status-stage.service';
import { StatusStageController } from './status-stage.controller';

@Module({
  providers: [StatusStageService],
  controllers: [StatusStageController],
})
export class StatusStageModule {}
