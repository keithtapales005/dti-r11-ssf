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

export interface BottomlineAccomplishmentReport {
  overall: ProvinceRow[];
  sectionA: ProvinceRow[];
  sectionB: ProvinceRow[];
  sectionC: ProvinceRow[];
  sectionD: ProvinceRow[];
  sectionE: ProvinceRow[];
  sectionF: ProvinceRow[];
  meta: {
    totalProjects: number;
    includedProjects: number;
    excludedIncomplete: number;
  };
}