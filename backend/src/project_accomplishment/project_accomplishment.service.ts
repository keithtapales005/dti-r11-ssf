import { Injectable } from '@nestjs/common';
import { CreateProjectAccomplishmentDto } from './dto/create_project_accomplishment.dto';
import { UpdateProjectAccomplishmentDto } from './dto/update_project_accomplishment.dto';
import { supabase } from 'src/supabase/supabase.client';
import * as XLSX from 'xlsx';
import { ImportAccomplishmentResultDto, ImportRowResult } from './dto/import_accomplishment_result.dto';

// 0-based column indices (Excel column - 1), matching both
// R11_CONSOLIDATED (region file) and 13A_Approved SSFs (province files)
const COL = {
  SSF_NUMBER: 0,           // column A
  FUND_SOURCE: 44,         // column 45
  AMOUNT_DISBURSED: 71,    // column 72
  OPERATIONAL_STATUS: 83,  // column 84
  CATEGORY: 88,            // column 89
  MSMES_MALE: 97,          // column 98
  MSMES_FEMALE: 98,        // column 99
  OTHER_USERS_MALE: 122,   // column 123
  OTHER_USERS_FEMALE: 123, // column 124
  EMPLOYMENT_MALE: 143,    // column 144
  EMPLOYMENT_FEMALE: 144,  // column 145
  SALES_GENERATED: 146,    // column 147
  INCOME_GENERATED: 147,   // column 148
  DEP_TRANSFER_SUCCESSFUL: 165,  // column 166
  BV_TRANSFER_SUCCESSFUL: 166,   // column 167
  DEP_TRANSFER_NEW: 173,         // column 174
  BV_TRANSFER_NEW: 174,          // column 175
  DEP_DISPOSAL: 179,             // column 180
  BV_DISPOSAL: 180,              // column 181
};

// The Excel files use slightly different wording than our DB's
// accomplishment_category check constraint. This normalizes them.
function normalizeCategory(raw: any): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const val = raw.trim();

  if (val.startsWith('Fully Transferred')) {
    return 'Fully Transferred with Terminal Report';
  }
  if (val.startsWith('Transferred to Successful Cooperator')) {
    return 'Transferred to Successful Cooperator';
  }
  if (val === 'Transferred to a New Cooperator') {
    return 'Transferred to a New Cooperator';
  }
  if (val === 'Maintained') {
    return 'Maintained';
  }
  if (val === 'Disposed') {
    return 'Disposed';
  }
  if (val === 'Extension of UA for 2 years') {
    return 'Extension of UA for 2 years';
  }
  return null; // unrecognized value — will be logged, not guessed
}


function getDepreciationAndBookValue(
  row: any[],
  category: string | null,
): { accumulated_depreciation: number | null; book_value_of_equipment: number | null } {
  const toNum = (v: any): number | null =>
    v === null || v === undefined || v === '' ? null : Number(v);

  if (category === 'Transferred to a New Cooperator') {
    return {
      accumulated_depreciation: toNum(row[COL.DEP_TRANSFER_NEW]),
      book_value_of_equipment: toNum(row[COL.BV_TRANSFER_NEW]),
    };
  }
  if (category === 'Fully Transferred with Terminal Report' || category === 'Transferred to Successful Cooperator') {
    return {
      accumulated_depreciation: toNum(row[COL.DEP_TRANSFER_SUCCESSFUL]),
      book_value_of_equipment: toNum(row[COL.BV_TRANSFER_SUCCESSFUL]),
    };
  }
  if (category === 'Disposed') {
    return {
      accumulated_depreciation: toNum(row[COL.DEP_DISPOSAL]),
      book_value_of_equipment: toNum(row[COL.BV_DISPOSAL]),
    };
  }

 
  return { accumulated_depreciation: null, book_value_of_equipment: null };
}

@Injectable()
export class ProjectAccomplishmentService {

    private readonly table = 'project_accomplishment';


    async upsertAccomplishment(dto: CreateProjectAccomplishmentDto, performedBy: number) {
        const { data: existing } = await supabase
            .from(this.table)
            .select('accomplishment_id')
            .eq('project_id', dto.project_id)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from(this.table)
                .update({ ...dto, updated_at: new Date().toISOString() })
                .eq('project_id', dto.project_id)
                .select()
                .single();

            if (error) throw new Error(error.message);

            await supabase.from('logs').insert({
                user_id: performedBy,
                table_name: this.table,
                affected_id: data.accomplishment_id,
                action: 'UPDATE',
            });

            return data;
        }

        const { data, error } = await supabase
            .from(this.table)
            .insert([dto])
            .select()
            .single();

        if (error) throw new Error(error.message);

        await supabase.from('logs').insert({
            user_id: performedBy,
            table_name: this.table,
            affected_id: data.accomplishment_id,
            action: 'CREATE',
        });

        return data;
    }

    async getByProject(projectId: number) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    }

    private async parseAndImportRows(rows: any[][], performedBy: number): Promise<ImportAccomplishmentResultDto> {
        const results: ImportRowResult[] = [];
        let imported = 0;

        for (const row of rows) {
            const ssfNumberRaw = row[COL.SSF_NUMBER];
            if (!ssfNumberRaw || typeof ssfNumberRaw !== 'string' || !ssfNumberRaw.trim()) {
                continue; // blank row, skip silently
            }
            const ssfNumber = ssfNumberRaw.trim();

            // Look up the matching project by ssf_number
            const { data: project, error: lookupError } = await supabase
                .from('project')
                .select('project_id')
                .eq('ssf_number', ssfNumber)
                .maybeSingle();

            if (lookupError) {
                results.push({ ssf_number: ssfNumber, status: 'skipped_error', reason: lookupError.message });
                continue;
            }

            if (!project) {
                results.push({ ssf_number: ssfNumber, status: 'skipped_no_match', reason: 'No project found with this SSF number' });
                continue;
            }

            const category = normalizeCategory(row[COL.CATEGORY]);
            const { accumulated_depreciation, book_value_of_equipment } = getDepreciationAndBookValue(row, category);

            const toNum = (v: any): number | null =>
                v === null || v === undefined || v === '' ? null : Number(v);
            const toStr = (v: any): string | undefined =>
                v === null || v === undefined || v === '' ? undefined : String(v).trim();

            const dto: CreateProjectAccomplishmentDto = {
                project_id: project.project_id,
                fund_source: toStr(row[COL.FUND_SOURCE]),
                accomplishment_category: category ?? undefined,
                operational_status: toStr(row[COL.OPERATIONAL_STATUS]),
                amount_disbursed: toNum(row[COL.AMOUNT_DISBURSED]) ?? undefined,
                msmes_assisted_male: toNum(row[COL.MSMES_MALE]) ?? undefined,
                msmes_assisted_female: toNum(row[COL.MSMES_FEMALE]) ?? undefined,
                other_users_assisted_male: toNum(row[COL.OTHER_USERS_MALE]) ?? undefined,
                other_users_assisted_female: toNum(row[COL.OTHER_USERS_FEMALE]) ?? undefined,
                employment_generated_male: toNum(row[COL.EMPLOYMENT_MALE]) ?? undefined,
                employment_generated_female: toNum(row[COL.EMPLOYMENT_FEMALE]) ?? undefined,
                sales_generated: toNum(row[COL.SALES_GENERATED]) ?? undefined,
                income_generated: toNum(row[COL.INCOME_GENERATED]) ?? undefined,
                accumulated_depreciation: accumulated_depreciation ?? undefined,
                book_value_of_equipment: book_value_of_equipment ?? undefined,
            };

            try {
                await this.upsertAccomplishment(dto, performedBy);
                results.push({ ssf_number: ssfNumber, status: 'imported' });
                imported++;
            } catch (err: any) {
                results.push({ ssf_number: ssfNumber, status: 'skipped_error', reason: err.message });
            }
        }

        return {
            total_rows_found: rows.length,
            imported,
            skipped: results.length - imported,
            results,
        };
    }

        // Entry point: takes the raw uploaded file buffer, finds the correct
    // worksheet (works for both the region file and province files),
    // locates where real data starts, and hands the rows off for import.
    async importFromExcel(fileBuffer: Buffer, performedBy: number): Promise<ImportAccomplishmentResultDto> {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames.includes('13A_Approved SSFs')
            ? '13A_Approved SSFs'
            : workbook.SheetNames.includes('R11_CONSOLIDATED')
            ? 'R11_CONSOLIDATED'
            : null;

        if (!sheetName) {
            throw new Error(
                'Could not find expected worksheet ("13A_Approved SSFs" or "R11_CONSOLIDATED") in this file.',
            );
        }

        const sheet = workbook.Sheets[sheetName];
        const allRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

        // Find the header row (the one where column A literally says "SSF No.")
        // then start reading from the row right after it.
        const headerRowIndex = allRows.findIndex(
            (row) => typeof row[COL.SSF_NUMBER] === 'string' && row[COL.SSF_NUMBER].trim() === 'SSF No.',
        );

        if (headerRowIndex === -1) {
            throw new Error('Could not find the header row ("SSF No.") in this file.');
        }

        const dataRows = allRows.slice(headerRowIndex + 1);

        return this.parseAndImportRows(dataRows, performedBy);
    }

}