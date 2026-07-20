import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { AccessModule } from './access/access.module';
import { ProjectManagementModule } from './project_management/project_management.module';
import { ProjectSupplyModule } from './project_supply/project_supply.module';
import { ProjectStatusModule } from './project_status/project_status.module';
import { ProvinceService } from './province/province.service';
import { ProvinceController } from './province/province.controller';
import { ProvinceModule } from './province/province.module';
import { StatusTypeModule } from './status-type/status-type.module';
import { StatusStageModule } from './status-stage/status-stage.module';
import { ApprovedProjectModule } from './approved-project/approved-project.module';
import { AuditModule } from './audit/audit.module';
import { ProjectConcernModule } from './project_concern/project_concern.module';
import { ProjectDocumentChecklistModule } from './project_document_checklist/project_document_checklist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    DepartmentModule,
    AccessModule,
    ProvinceModule,
    StatusTypeModule,
    StatusStageModule,
    ProjectManagementModule,
    ProjectSupplyModule,
    ProjectConcernModule,
    ProjectStatusModule,
    ApprovedProjectModule,
    AuditModule,
    ProjectConcernModule,
    ProjectDocumentChecklistModule,
  ],
  controllers: [AppController, ProvinceController],
  providers: [AppService, ProvinceService],
})
export class AppModule { }