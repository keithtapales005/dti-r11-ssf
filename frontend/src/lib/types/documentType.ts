export interface DocumentType {
  document_type_id: number;
  name: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CompletenessItem {
  document_type_id: number;
  name: string;
  is_required: boolean;
  file_count: number;
  satisfied: boolean;
}

export interface ProjectCompleteness {
  project_id: number;
  required_total: number;
  required_satisfied: number;
  missing: string[];
  is_complete: boolean;
  items: CompletenessItem[];
}