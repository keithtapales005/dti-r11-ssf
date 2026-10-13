import {
    Controller,
    Post,
    Get,
    Patch,
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
import { UpdateFileDto } from './dto/update_file.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';

interface UploadedFileType {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
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

    @Roles(Role.SUPERADMIN)
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateFileDto, @CurrentUser('user_id') userId: number) {
        return this.filesService.updateFile(id, dto.file_name, userId);
    }

    @Roles(Role.SUPERADMIN)
    @Delete(':id')
    delete(@Param('id') id: number, @CurrentUser('user_id') userId: number) {
        return this.filesService.deleteFile(id, userId);
    }
}