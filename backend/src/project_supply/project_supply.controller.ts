import { Controller, Post, Body, Patch, Delete, Param, Get, UseGuards } from '@nestjs/common';
import { ProjectSupplyService } from './project_supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project-supply')
export class ProjectSupplyController {
    constructor(private readonly projectSupplyService: ProjectSupplyService) {}

    @Post()
    create(@Body() dto: CreateSupplyDto, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.createSupply(dto, userId);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateSupplyDto, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.updateSupply(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.projectSupplyService.deleteSupply(id, userId);
    }

    @Get('project/:projectId')
    getForProject(@Param('projectId') projectId: number) {
        return this.projectSupplyService.getSuppliesForProject(projectId);
    }
}