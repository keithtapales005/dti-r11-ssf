export interface LookupValue {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
}

export interface LookupList {
  key: string;
  label: string;
}

export interface UpdateLookupDto {
  name?: string;
  is_active?: boolean;
  sort_order?: number;
}
