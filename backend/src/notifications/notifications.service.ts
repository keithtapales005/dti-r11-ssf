import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

type NotificationType = 'SELF_REGISTER' | 'FILE_UPLOAD';

@Injectable()
export class NotificationsService {
    private readonly table = 'notifications';

    private async create(params: {
        type: NotificationType;
        message: string;
        actorUserId?: number;
        referenceTable?: string;
        referenceId?: number;
    }) {
        const { error } = await supabase.from(this.table).insert({
            type: params.type,
            message: params.message,
            actor_user_id: params.actorUserId,
            reference_table: params.referenceTable,
            reference_id: params.referenceId,
        });
        if (error) {
            console.error('Failed to create notification:', error);
        }
    }

    async notifySelfRegister(userId: number, username: string) {
        try {
            await this.create({
                type: 'SELF_REGISTER',
                message: `${username} submitted a self-registration request.`,
                actorUserId: userId,
                referenceTable: 'users',
                referenceId: userId,
            });
        } catch (err) {
            console.error('notifySelfRegister failed:', err);
        }
    }

    async notifyFileUpload(
        file: { file_id: number; file_name: string; project_id: number },
        actorUserId: number,
    ) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('username')
                .eq('user_id', actorUserId)
                .maybeSingle();

            const { data: project } = await supabase
                .from('project')
                .select('project_title')
                .eq('project_id', file.project_id)
                .maybeSingle();

            await this.create({
                type: 'FILE_UPLOAD',
                message: `${user?.username ?? 'A user'} uploaded "${file.file_name}" to ${project?.project_title ?? `project #${file.project_id}`}.`,
                actorUserId,
                referenceTable: 'files',
                referenceId: file.file_id,
            });
        } catch (err) {
            console.error('notifyFileUpload failed:', err);
        }
    }

    async getNotifications(page: number, limit: number, unreadOnly: boolean) {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
            .from(this.table)
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error, count } = await query.range(from, to);
        if (error) throw new Error(error.message);

        return {
            data,
            page,
            limit,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / limit),
        };
    }

    async getUnreadCount() {
        const { count, error } = await supabase
            .from(this.table)
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false);
        if (error) throw new Error(error.message);
        return { count: count ?? 0 };
    }

    async markAsRead(id: number) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new NotFoundException('Notification not found');
        return data;
    }

    async markAllAsRead() {
        const { error } = await supabase
            .from(this.table)
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('is_read', false);
        if (error) throw new Error(error.message);
        return { message: 'All notifications marked as read' };
    }
}