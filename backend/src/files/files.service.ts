import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create_file.dto';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class FilesService {

    private readonly table = 'files';
    private readonly bucket = 'Files';

    async uploadFile(dto: CreateFileDto, fileBuffer: Buffer, originalFileName: string, mimeType: string, fileSize: number, performedBy: number) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const storagePath = `project-${dto.project_id}/${uniqueSuffix}-${originalFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(this.bucket)
            .upload(storagePath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const { data, error } = await supabase
            .from(this.table)
            .insert([
                {
                    project_id: dto.project_id,
                    created_by: performedBy,
                    file_name: dto.file_name || originalFileName,
                    file_type: mimeType,
                    file_path: storagePath,
                    file_size: fileSize,
                },
            ])
            .select()
            .single();

        if (error) {
            await supabase.storage.from(this.bucket).remove([storagePath]);
            throw new Error(error.message);
        }

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.file_id,
            action: 'CREATE',
        });

        return data;
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

        return data;
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
            .select('file_path')
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

        await supabase.from('logs').insert({
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

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: fileId,
            action: 'UPDATE',
        });

        return data;
    }
}