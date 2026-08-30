import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.get<string[]>('audit', context.getHandler());

    if (!auditMeta) {
      return next.handle();
    }

    const [action, tableName] = auditMeta;
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.user_id;

    return next.handle().pipe(
      tap((response) => {
        if (!userId) return;

        const idFieldMap: Record<string, string> = {
          users: 'user_id',
          project: 'project_id',
          project_concern: 'project_concern_id',
          project_supply: 'project_supply_id',
        };

        const idField = tableName ? idFieldMap[tableName] : undefined;

        const affectedId =
          (idField && response?.data?.[idField]) ??
          response?.data?.user_id ??
          response?.user?.user_id ??
          request.params?.id;

        if (affectedId) {
          this.auditService.createLog(userId, Number(affectedId), action as any, tableName);
        }
      }),
    );
  }
}