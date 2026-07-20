export interface ChecklistItem {
  checklist_id: string;
  project_id: number;
  document_name: string;
  status: "Pending" | "Uploaded" | "Verified";
  file_id?: number | null;
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
  status?: "Pending" | "Uploaded" | "Verified";
}

export interface UpdateChecklistItemDto {
  document_name?: string;
  status?: "Pending" | "Uploaded" | "Verified";
}