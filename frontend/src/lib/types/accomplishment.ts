export interface ProjectAccomplishment {
  accomplishment_id: string;
  project_id: number;
  fund_source?: string | null;
  accomplishment_category?: string | null;
  operational_status?: string | null;
  amount_disbursed?: number | null;
  msmes_assisted_male?: number | null;
  msmes_assisted_female?: number | null;
  other_users_assisted_male?: number | null;
  other_users_assisted_female?: number | null;
  employment_generated_male?: number | null;
  employment_generated_female?: number | null;
  sales_generated?: number | null;
  income_generated?: number | null;
  accumulated_depreciation?: number | null;
  book_value_of_equipment?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertAccomplishmentDto {
  project_id: number;
  fund_source?: string;
  accomplishment_category?: string;
  operational_status?: string;
  amount_disbursed?: number;
  msmes_assisted_male?: number;
  msmes_assisted_female?: number;
  other_users_assisted_male?: number;
  other_users_assisted_female?: number;
  employment_generated_male?: number;
  employment_generated_female?: number;
  sales_generated?: number;
  income_generated?: number;
  accumulated_depreciation?: number;
  book_value_of_equipment?: number;
}