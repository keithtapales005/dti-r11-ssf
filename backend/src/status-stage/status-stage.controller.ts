import { Controller, Get, Param, UseGuards} from '@nestjs/common';
import { StatusStageService } from './status-stage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('status-stage')
export class StatusStageController {
  constructor(private readonly statusStageService: StatusStageService) {}

  @Get()
  async getAllStatusStages() {
    return this.statusStageService.getAllStatusStages();
  }

  @Get(':id')
  async getStatusStage(@Param('id') id: string) {
    return this.statusStageService.getStatusStage(Number(id));
  }
}
