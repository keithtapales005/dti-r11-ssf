import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create_file.dto';
import { supabase } from 'src/supabase/supabase.client';
import { NotificationsService } from '../notifications/notifications.service';
import { insertLog, encodeRow, decodeRows } from '../lookups/lookups';
import { syncDocumentStatus } from '../project_document_checklist/checklist-sync';

@Injectable()
export class FilesService {

    private readonly table = 'files';
    private readonly bucket = 'Files';

    constructor(private readonly notificationsService: NotificationsService) { }

    async uploadFile(dto: CreateFileDto, fileBuffer: Buffer, originalFileName: string, mimeType: string, fileSize: number, performedBy: number) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `project-${dto.project_id}/${uniqueSuffix}-${sanitizedFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(this.bucket)
            .upload(storagePath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const payload = await encodeRow(this.table, {
            project_id: dto.project_id,
            created_by: performedBy,
            file_name: dto.file_name || originalFileName,
            file_type: mimeType,
            file_path: storagePath,
            file_size: fileSize,
            document_type_id: dto.document_type_id,
        });

        const { data, error } = await supabase
            .from(this.table)
            .insert([payload])
            .select()
            .single();

        if (error) {
            await supabase.storage.from(this.bucket).remove([storagePath]);
            throw new Error(error.message);
        }

        await insertLog({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.file_id,
            action: 'CREATE',
        });

        await syncDocumentStatus(dto.project_id, dto.document_type_id);

        await this.notificationsService.notifyFileUpload(data, performedBy);

        return decodeRows(this.table, data);
    }

    async getFilesByProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return decodeRows(this.table, data);
    }

    async getSignedUrl(filePath: string) {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .createSignedUrl(filePath, 60 * 5);

        if (error) {
            throw new Error(error.message);
        }

        return { url: data.signedUrl };
    }

    async deleteFile(fileId: number, performedBy: number) {
        const { data: file, error: fetchError } = await supabase
            .from(this.table)
            .select('file_path, project_id, document_type_id')
            .eq('file_id', fileId)
            .single();

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        const { error } = await supabase
            .from(this.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('file_id', fileId);

        if (error) {
            throw new Error(error.message);
        }

        await supabase.storage.from(this.bucket).remove([file.file_path]);
        await syncDocumentStatus(file.project_id, file.document_type_id);

        await insertLog({
            user_id: performedBy,
            table_name: this.table,
            affected_id: fileId,
            action: 'DELETE',
        });

        return { message: 'File deleted successfully' };
    }

    async updateFile(fileId: number, fileName: string, performedBy: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ file_name: fileName, updated_at: new Date().toISOString() })
            .eq('file_id', fileId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        await insertLog({
            user_id: performedBy,
            table_name: this.table,
            affected_id: fileId,
            action: 'UPDATE',
        });

        return decodeRows(this.table, data);
    }
}