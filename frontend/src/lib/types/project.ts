export interface Project {
  project_id: number;
  province_id: number;
  created_by: number;
  project_status_id: number;
  ssf_number: string;
  business_name: string;
  project_title: string;
  year_launched?: number | null;
  date_established?: string | null;
  industry?: string | null;
  project_cost?: number | null;
  created_at: string;
  updated_at: string;
  updated_by_user_id?: number | null;
  proposed_by?: number | null;
  project_status?: { status_name: string } | null;
  province?: { province_name: string } | null;
}

export interface CreateProjectDto {
  province_id: number;
  created_by: number;
  project_status_id: number;
  ssf_number: string;
  business_name: string;
  project_title: string;
  year_launched?: number;
  date_established?: string;
  industry?: string;
  project_cost?: number;
  proposed_by?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> { }