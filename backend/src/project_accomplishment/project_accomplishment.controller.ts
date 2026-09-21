import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProjectAccomplishmentService } from './project_accomplishment.service';
import { CreateProjectAccomplishmentDto } from './dto/create_project_accomplishment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

interface UploadedFileType {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('project-accomplishment')
export class ProjectAccomplishmentController {
    constructor(private readonly accomplishmentService: ProjectAccomplishmentService) {}

    @Post()
    upsert(@Body() dto: CreateProjectAccomplishmentDto, @CurrentUser('user_id') userId: number) {
        return this.accomplishmentService.upsertAccomplishment(dto, userId);
    }

    @Get('project/:projectId')
    getByProject(@Param('projectId') projectId: number) {
        return this.accomplishmentService.getByProject(projectId);
    }

        @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(
    @UploadedFile() file: UploadedFileType,
        @CurrentUser('user_id') userId: number,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded. Send it as form-data with field name "file".');
        }
        return this.accomplishmentService.importFromExcel(file.buffer, userId);
    }
}