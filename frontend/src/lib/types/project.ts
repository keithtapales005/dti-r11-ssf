export interface Project {
    project_id: number;
    province_id: number;
    created_by: number;
    project_status_id: number;
    ssf_number: string;
    business_name: string;
    project_title: string;
    proposed_by?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by_user_id: number | null;
}

export interface CreateProjectDto {
    province_id: number;
    created_by: number;
    project_status_id: number;
    ssf_number: string;
    business_name: string;
    project_title: string;
    proposed_by?: string;
}

export interface UpdateProjectDto {
    province_id?: number;
    created_by?: number;
    project_status_id?: number;
    ssf_number?: string;
    business_name?: string;
    project_title?: string;
    proposed_by?: string;
}