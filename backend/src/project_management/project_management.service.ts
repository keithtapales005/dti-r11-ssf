import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '../auth/enum/role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ensureChecklist } from '../project_document_checklist/checklist-sync';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class ProjectManagementService {

  private readonly table = 'project';

    async createProject(createProjectDto: CreateProjectDto, performedBy: number) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('province_id, role(role_name)')
      .eq('user_id', performedBy)
      .maybeSingle();

    if (userError || !user) {
      throw new ForbiddenException('Could not verify your account.');
    }

    let provinceId = createProjectDto.province_id;

    // Everyone except the Super Admin is locked to their registered province
    if ((user as any).role?.role_name !== Role.SUPERADMIN) {
      if (!user.province_id) {
        throw new ForbiddenException(
          'Your account has no designated province. Contact the Super Administrator.',
        );
      }
      provinceId = user.province_id;
    }

    const { data, error } = await supabase.from(this.table).insert([
      {
        province_id: provinceId,
        created_by: createProjectDto.created_by,
        project_status_id: createProjectDto.project_status_id,
        ssf_number: createProjectDto.ssf_number,
        business_name: createProjectDto.business_name,
        project_title: createProjectDto.project_title,
        year_launched: createProjectDto.year_launched,
        date_established: createProjectDto.date_established,
        industry: createProjectDto.industry,
        project_cost: createProjectDto.project_cost,
        proposed_by: createProjectDto.proposed_by,
      },
    ]).select()
      .single();
    if (error) {
      throw new Error(error.message);
    }

    try {
      await ensureChecklist(data.project_id);
    } catch (err) {
      console.error('ensureChecklist failed:', (err as Error).message); // it is also created when the checklist is first opened
    }

    return { message: 'Project created successfully', data };
  }

  async updateProject(id: number, dto: UpdateProjectDto, performedBy: number) {
    const { data, error } = await supabase
      .from(this.table)
      .update({ ...dto, updated_by_user_id: performedBy })
      .eq('project_id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { message: 'Project updated successfully', data };
  }

  async deleteProject(id: number, performedBy: number) {
    const { data, error } = await supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('project_id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { message: 'Project deleted successfully', data };
  }

  async getProject(id: number) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, project_status(status_name), province(province_name)')
      .eq('project_id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllProjects(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) {
      throw new Error(error.message);
    }
    return { data, page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) };
  }

}