"use client";

import { useState } from "react";
import { useBottomlineAccomplishmentReport } from "@/lib/queries/reportQueries";
import ReportFullTable from "@/app/components/report-full-table";
import ReportSlimTable from "@/app/components/report-slim-table";
import ReportDepreciationTable from "@/app/components/report-depreciation-table";

type SectionKey = "overall" | "sectionA" | "sectionB" | "sectionC" | "sectionD" | "sectionE" | "sectionF";

const SECTION_TABS: { key: SectionKey; label: string }[] = [
  { key: "overall", label: "Overall Accomplishment" },
  { key: "sectionA", label: "Maintained SSF Projects" },
  { key: "sectionB", label: "Transferred to Successful Cooperators" },
  { key: "sectionC", label: "Transferred to New Cooperators" },
  { key: "sectionD", label: "Extended" },
  { key: "sectionE", label: "Disposed" },
  { key: "sectionF", label: "Fully Transferred" },
];

export default function ReportsPage() {
  const { data: report, isLoading, error } = useBottomlineAccomplishmentReport();
  const [activeSection, setActiveSection] = useState<SectionKey>("overall");

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading report...</div>;
  }

  if (error || !report) {
    return <div className="p-8 text-center text-red-500">Failed to load report.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#182286]">Bottomline Accomplishment Report</h1>

        <div className="flex gap-4 text-sm text-gray-700 bg-white rounded-lg p-4">
          <span>Total Projects: <strong>{report.meta.totalProjects}</strong></span>
          <span>Included: <strong>{report.meta.includedProjects}</strong></span>
          <span>Excluded (Incomplete Data): <strong>{report.meta.excludedIncomplete}</strong></span>
        </div>

        <div className="flex gap-3 flex-wrap">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeSection === tab.key ? "border-[#182286] text-[#182286] bg-white" : "border-transparent text-gray-500 bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

                <div className="bg-white rounded-lg p-6">
          {(activeSection === "overall" || activeSection === "sectionA" || activeSection === "sectionB") && (
            <ReportFullTable rows={report[activeSection]} />
          )}
          {(activeSection === "sectionC" || activeSection === "sectionD") && (
            <ReportSlimTable rows={report[activeSection]} />
          )}
          {(activeSection === "sectionE" || activeSection === "sectionF") && (
            <ReportDepreciationTable rows={report[activeSection]} />
          )}
        </div>
      </div>
    </div>
  );
}