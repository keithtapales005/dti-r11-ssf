"use client";

import { useState, useEffect } from "react";
import InputField from "@/app/components/input-field";
import { useAccomplishmentByProject } from "@/lib/queries/accomplishmentQueries";
import { useUpsertAccomplishment } from "@/lib/mutations/accomplishmentMutation";

const ACCOMPLISHMENT_CATEGORIES = [
  "Maintained",
  "Transferred to Successful Cooperator",
  "Transferred to a New Cooperator",
  "Extension of UA for 2 years",
  "Disposed",
  "Fully Transferred with Terminal Report",
];

const OPERATIONAL_STATUSES = ["Fully Operational", "Partially Operational", "Non-Operational"];

interface ProjectAccomplishmentFormProps {
  projectId: number;
}

export default function ProjectAccomplishmentForm({ projectId }: ProjectAccomplishmentFormProps) {
  const { data: accomplishment, isLoading } = useAccomplishmentByProject(projectId);
  const upsertAccomplishment = useUpsertAccomplishment();

  const [fundSource, setFundSource] = useState("");
  const [category, setCategory] = useState("");
  const [operationalStatus, setOperationalStatus] = useState("");
  const [amountDisbursed, setAmountDisbursed] = useState("");
  const [msmesMale, setMsmesMale] = useState("");
  const [msmesFemale, setMsmesFemale] = useState("");
  const [otherUsersMale, setOtherUsersMale] = useState("");
  const [otherUsersFemale, setOtherUsersFemale] = useState("");
  const [employmentMale, setEmploymentMale] = useState("");
  const [employmentFemale, setEmploymentFemale] = useState("");
  const [salesGenerated, setSalesGenerated] = useState("");
  const [incomeGenerated, setIncomeGenerated] = useState("");
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState("");
  const [bookValue, setBookValue] = useState("");

  // Once existing accomplishment data loads, fill the form with it
  useEffect(() => {
    if (accomplishment) {
      setFundSource(accomplishment.fund_source ?? "");
      setCategory(accomplishment.accomplishment_category ?? "");
      setOperationalStatus(accomplishment.operational_status ?? "");
      setAmountDisbursed(accomplishment.amount_disbursed?.toString() ?? "");
      setMsmesMale(accomplishment.msmes_assisted_male?.toString() ?? "");
      setMsmesFemale(accomplishment.msmes_assisted_female?.toString() ?? "");
      setOtherUsersMale(accomplishment.other_users_assisted_male?.toString() ?? "");
      setOtherUsersFemale(accomplishment.other_users_assisted_female?.toString() ?? "");
      setEmploymentMale(accomplishment.employment_generated_male?.toString() ?? "");
      setEmploymentFemale(accomplishment.employment_generated_female?.toString() ?? "");
      setSalesGenerated(accomplishment.sales_generated?.toString() ?? "");
      setIncomeGenerated(accomplishment.income_generated?.toString() ?? "");
      setAccumulatedDepreciation(accomplishment.accumulated_depreciation?.toString() ?? "");
      setBookValue(accomplishment.book_value_of_equipment?.toString() ?? "");
    }
  }, [accomplishment]);

  const toNumOrUndefined = (v: string): number | undefined => (v === "" ? undefined : Number(v));

  const handleSave = () => {
    upsertAccomplishment.mutate({
      project_id: projectId,
      fund_source: fundSource || undefined,
      accomplishment_category: category || undefined,
      operational_status: operationalStatus || undefined,
      amount_disbursed: toNumOrUndefined(amountDisbursed),
      msmes_assisted_male: toNumOrUndefined(msmesMale),
      msmes_assisted_female: toNumOrUndefined(msmesFemale),
      other_users_assisted_male: toNumOrUndefined(otherUsersMale),
      other_users_assisted_female: toNumOrUndefined(otherUsersFemale),
      employment_generated_male: toNumOrUndefined(employmentMale),
      employment_generated_female: toNumOrUndefined(employmentFemale),
      sales_generated: toNumOrUndefined(salesGenerated),
      income_generated: toNumOrUndefined(incomeGenerated),
      accumulated_depreciation: toNumOrUndefined(accumulatedDepreciation),
      book_value_of_equipment: toNumOrUndefined(bookValue),
    });
  };

  if (isLoading) {
    return <div className="bg-white rounded-lg p-6 text-gray-500">Loading accomplishment data...</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Fund Source" name="fundSource" placeholder="e.g. 2020 GAA" value={fundSource} onChange={setFundSource} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Accomplishment Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm rounded-md border border-gray-300 px-3 py-2 outline-none"
          >
            <option value="">-- Select --</option>
            {ACCOMPLISHMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Operational Status</label>
          <select
            value={operationalStatus}
            onChange={(e) => setOperationalStatus(e.target.value)}
            className="text-sm rounded-md border border-gray-300 px-3 py-2 outline-none"
          >
            <option value="">-- Select --</option>
            {OPERATIONAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <InputField label="Amount Disbursed" name="amountDisbursed" placeholder="0.00" value={amountDisbursed} onChange={setAmountDisbursed} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="MSMEs Assisted (Male)" name="msmesMale" placeholder="0" value={msmesMale} onChange={setMsmesMale} type="number" />
        <InputField label="MSMEs Assisted (Female)" name="msmesFemale" placeholder="0" value={msmesFemale} onChange={setMsmesFemale} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Other Users Assisted (Male)" name="otherUsersMale" placeholder="0" value={otherUsersMale} onChange={setOtherUsersMale} type="number" />
        <InputField label="Other Users Assisted (Female)" name="otherUsersFemale" placeholder="0" value={otherUsersFemale} onChange={setOtherUsersFemale} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Employment Generated (Male)" name="employmentMale" placeholder="0" value={employmentMale} onChange={setEmploymentMale} type="number" />
        <InputField label="Employment Generated (Female)" name="employmentFemale" placeholder="0" value={employmentFemale} onChange={setEmploymentFemale} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Sales Generated" name="salesGenerated" placeholder="0.00" value={salesGenerated} onChange={setSalesGenerated} type="number" />
        <InputField label="Income Generated" name="incomeGenerated" placeholder="0.00" value={incomeGenerated} onChange={setIncomeGenerated} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Accumulated Depreciation" name="accumulatedDepreciation" placeholder="0.00" value={accumulatedDepreciation} onChange={setAccumulatedDepreciation} type="number" />
        <InputField label="Book Value of Equipment" name="bookValue" placeholder="0.00" value={bookValue} onChange={setBookValue} type="number" />
      </div>

      <button
        onClick={handleSave}
        disabled={upsertAccomplishment.isPending}
        className="px-4 py-2 rounded-md bg-[#182286] text-white text-sm font-semibold disabled:opacity-50"
      >
        {upsertAccomplishment.isPending ? "Saving..." : "Save Accomplishment Data"}
      </button>
    </div>
  );
}