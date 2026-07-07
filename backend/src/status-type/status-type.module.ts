import { Module } from '@nestjs/common';
import { StatusTypeService } from './status-type.service';
import { StatusTypeController } from './status-type.controller';

@Module({
  providers: [StatusTypeService],
  controllers: [StatusTypeController]
})
export class StatusTypeModule {}
