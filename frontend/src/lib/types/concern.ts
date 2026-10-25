export interface ProjectConcern {
  project_concern_id: number;
  project_id: number;
  category: string;
  description: string;
  reported_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProjectConcernDto {
  project_id: number;
  category: string;
  description: string;
}

export interface UpdateProjectConcernDto extends Partial<CreateProjectConcernDto> { }