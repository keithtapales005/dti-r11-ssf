import { Controller, Get, Param,Post, Body,Patch , UseGuards} from '@nestjs/common';
import { ApprovedProjectService } from './approved-project.service';
import { CreateApprovedProjectDto } from './dto/create-approved-projet.dto';
import { UpdateApprovedProjectDto } from './dto/update-approved-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('approved-project')
export class ApprovedProjectController {
    constructor(private readonly approvedProjectService: ApprovedProjectService) {}

    @Get(':id')
    getApprovedProject(@Param('id') id: number) {
            return this.approvedProjectService.getApprovedProject(id);
    }
    @Get('all')
    getAllApprovedProjects() {
        return this.approvedProjectService.getAllApprovedProjects();
    }
    @Post('')
    approveProject(@Body() createApprovedProjectDto: CreateApprovedProjectDto) {
        return this.approvedProjectService.approveProject(createApprovedProjectDto);
    }
    @Patch(':id')
    updateApprovedProject(@Param('id') id: number, @Body() updateApprovedProjectDto: UpdateApprovedProjectDto) {
        return this.approvedProjectService.updateApprovedProject(id, updateApprovedProjectDto);
    }
}
