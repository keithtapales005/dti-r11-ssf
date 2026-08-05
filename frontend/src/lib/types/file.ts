export interface ProjectFile {
  file_id: number;
  project_id: number;
  created_by: number;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  external_link?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}