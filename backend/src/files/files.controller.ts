import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create_file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

interface UploadedFileType {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: UploadedFileType,
        @Body() dto: CreateFileDto,
        @CurrentUser('user_id') userId: number,
    ) {
        if (!file) {
            throw new BadRequestException('No file was uploaded');
        }

        return this.filesService.uploadFile(
            dto,
            file.buffer,
            file.originalname,
            file.mimetype,
            file.size,
            userId,
        );
    }

    @Get('project/:projectId')
    getFilesByProject(@Param('projectId') projectId: number) {
        return this.filesService.getFilesByProject(projectId);
    }

    @Get('signed-url')
    getSignedUrl(@Query('filePath') filePath: string) {
        return this.filesService.getSignedUrl(filePath);
    }

    @Delete(':id')
    delete(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.filesService.deleteFile(id, userId);
    }
}