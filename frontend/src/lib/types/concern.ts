export interface ProjectConcern {
  project_concern_id: number;
  project_id: number;
  category: "Challenge" | "Operational Concern" | "Grievance";
  description: string;
  reported_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProjectConcernDto {
  project_id: number;
  category: "Challenge" | "Operational Concern" | "Grievance";
  description: string;
}

export interface UpdateProjectConcernDto extends Partial<CreateProjectConcernDto> {}