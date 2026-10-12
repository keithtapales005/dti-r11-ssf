import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [NotificationsModule],
})

export class FilesModule { }