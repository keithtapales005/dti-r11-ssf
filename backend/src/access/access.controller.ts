import { Controller, Get, Param, UseGuards} from '@nestjs/common';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-status')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get('')
  getAllUserStatuses() {
    return this.accessService.getAllUserStatuses();
  }

  @Get(':id')
  getUserStatusById(@Param('id') id: string) {
    return this.accessService.getUserStatusById(Number(id));
  }
}
