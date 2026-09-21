import { Injectable } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';

const CATEGORY_TO_SECTION: Record<string, string> = {
  'Maintained': 'A',
  'Transferred to Successful Cooperator': 'B',
  'Transferred to a New Cooperator': 'C',
  'Extension of UA for 2 years': 'D',
  'Disposed': 'E',
  'Fully Transferred with Terminal Report': 'F',
};

// Sections that also count toward the "Overall Accomplishment (A+B)" table
const OVERALL_CATEGORIES = ['Maintained', 'Transferred to Successful Cooperator'];

export interface ProvinceRow {
  province: string;
  perFundSource: number;
  perActualCount: number;
  totalAmountDisbursed: number;
  fullyOperational: number;
  partiallyOperational: number;
  nonOperational: number;
  percentOperational: number;
  msmesMale: number;
  msmesFemale: number;
  otherUsersMale: number;
  otherUsersFemale: number;
  employmentMale: number;
  employmentFemale: number;
  salesGenerated: number;
  incomeGenerated: number;
  projectCost: number;
  accumulatedDepreciation: number;
  bookValueOfEquipment: number;
}

@Injectable()
export class ReportsService {

    async getBottomlineAccomplishmentData() {
        // Pull every non-deleted project along with its accomplishment record and province name
        const { data: projects, error } = await supabase
            .from('project')
            .select(`
                project_id,
                project_cost,
                province:province_id ( province_name ),
                project_accomplishment ( * )
            `)
            .is('deleted_at', null);

        if (error) throw new Error(error.message);

        // "Complete" means it has everything needed to correctly place and sum this project
        const complete = (projects ?? []).filter((p: any) => {
            const acc = Array.isArray(p.project_accomplishment) ? p.project_accomplishment[0] : p.project_accomplishment;
            return (
                p.province?.province_name &&
                acc?.accomplishment_category &&
                acc?.operational_status &&
                acc?.fund_source &&
                acc?.amount_disbursed !== null &&
                acc?.amount_disbursed !== undefined
            );
        }).map((p: any) => ({
            projectCost: p.project_cost ?? 0,
            province: p.province.province_name,
            acc: Array.isArray(p.project_accomplishment) ? p.project_accomplishment[0] : p.project_accomplishment,
        }));

        const excludedCount = (projects?.length ?? 0) - complete.length;

        // Build one grouped table (province -> aggregated row) for a given list of matching projects
        const buildTable = (rows: typeof complete): ProvinceRow[] => {
            const byProvince = new Map<string, ProvinceRow>();

            for (const row of rows) {
                const key = row.province;
                if (!byProvince.has(key)) {
                    byProvince.set(key, {
                        province: key,
                        perFundSource: 0, perActualCount: 0, totalAmountDisbursed: 0,
                        fullyOperational: 0, partiallyOperational: 0, nonOperational: 0, percentOperational: 0,
                        msmesMale: 0, msmesFemale: 0, otherUsersMale: 0, otherUsersFemale: 0,
                        employmentMale: 0, employmentFemale: 0, salesGenerated: 0, incomeGenerated: 0,
                        projectCost: 0, accumulatedDepreciation: 0, bookValueOfEquipment: 0,
                    });
                }
                const acc = row.acc;
                const bucket = byProvince.get(key)!;

                bucket.perFundSource += 1;
                bucket.perActualCount += 1;
                bucket.totalAmountDisbursed += Number(acc.amount_disbursed ?? 0);
                bucket.projectCost += Number(row.projectCost ?? 0);
                bucket.accumulatedDepreciation += Number(acc.accumulated_depreciation ?? 0);
                bucket.bookValueOfEquipment += Number(acc.book_value_of_equipment ?? 0);

                if (acc.operational_status === 'Fully Operational') bucket.fullyOperational += 1;
                else if (acc.operational_status === 'Partially Operational') bucket.partiallyOperational += 1;
                else if (acc.operational_status === 'Non-Operational') bucket.nonOperational += 1;

                bucket.msmesMale += Number(acc.msmes_assisted_male ?? 0);
                bucket.msmesFemale += Number(acc.msmes_assisted_female ?? 0);
                bucket.otherUsersMale += Number(acc.other_users_assisted_male ?? 0);
                bucket.otherUsersFemale += Number(acc.other_users_assisted_female ?? 0);
                bucket.employmentMale += Number(acc.employment_generated_male ?? 0);
                bucket.employmentFemale += Number(acc.employment_generated_female ?? 0);
                bucket.salesGenerated += Number(acc.sales_generated ?? 0);
                bucket.incomeGenerated += Number(acc.income_generated ?? 0);
            }

            // Compute % Operational per province now that totals are known
            for (const bucket of byProvince.values()) {
                bucket.percentOperational = bucket.perActualCount
                    ? bucket.fullyOperational / bucket.perActualCount
                    : 0;
            }

            return Array.from(byProvince.values());
        };

        const sections: Record<string, ProvinceRow[]> = {};
        for (const category of Object.keys(CATEGORY_TO_SECTION)) {
            const matching = complete.filter((r) => r.acc.accomplishment_category === category);
            sections[CATEGORY_TO_SECTION[category]] = buildTable(matching);
        }

        const overallRows = complete.filter((r) => OVERALL_CATEGORIES.includes(r.acc.accomplishment_category));
        const overall = buildTable(overallRows);

        return {
            overall,
            sectionA: sections['A'],
            sectionB: sections['B'],
            sectionC: sections['C'],
            sectionD: sections['D'],
            sectionE: sections['E'],
            sectionF: sections['F'],
            meta: {
                totalProjects: projects?.length ?? 0,
                includedProjects: complete.length,
                excludedIncomplete: excludedCount,
            },
        };
    }
}