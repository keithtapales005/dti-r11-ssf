export class ImportRowResult {
  ssf_number!: string;
  status!: 'imported' | 'skipped_no_match' | 'skipped_error';
  reason?: string;
}

export class ImportAccomplishmentResultDto {
  total_rows_found!: number;
  imported!: number;
  skipped!: number;
  results!: ImportRowResult[];
}