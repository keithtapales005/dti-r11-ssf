export interface ChecklistItem {
  checklist_id: number;
  project_id: number;
  document_type_id: number;
  document_name: string;
  status: string;
  verified_by?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistResponse {
  items: ChecklistItem[];
  total: number;
  verifiedCount: number;
  progressPercentage: number;
}

export interface CreateChecklistItemDto {
  project_id: number;
  document_name: string;
  status?: string;
}

export interface UpdateChecklistItemDto {
  document_name?: string;
  status?: string;
}