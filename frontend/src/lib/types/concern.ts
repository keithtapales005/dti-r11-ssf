export interface Concern {
    project_concern_id: number;
    project_id: number;
    category: "Challenge" | "Operational Concern" | "Grievance";
    description: string;
    reported_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateConcernDto {
    project_id: number;
    category: "Challenge" | "Operational Concern" | "Grievance";
    description: string;
    reported_by?: number;
}

export interface UpdateConcernDto {
    category?: "Challenge" | "Operational Concern" | "Grievance";
    description?: string;
}