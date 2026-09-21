import { ProvinceRow } from "@/lib/types/report";

interface ReportSlimTableProps {
  rows: ProvinceRow[];
}

export default function ReportSlimTable({ rows }: ReportSlimTableProps) {
  if (rows.length === 0) {
    return <p className="text-gray-500 text-sm py-6 text-center">No projects in this section yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#182286] text-white">
            <th rowSpan={2} className="px-3 py-2 border border-white/20 align-middle">Province</th>
            <th colSpan={2} className="px-3 py-2 border border-white/20">No. of SSF Projects</th>
            <th rowSpan={2} className="px-3 py-2 border border-white/20 align-middle">Project Cost</th>
          </tr>
          <tr className="bg-[#182286] text-white">
            <th className="px-3 py-2 border border-white/20">Per Fund Source</th>
            <th className="px-3 py-2 border border-white/20">Per Actual Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.province} className="text-center even:bg-gray-50">
              <td className="px-3 py-2 border border-gray-200 text-left font-medium text-gray-800">{row.province}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.perFundSource}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.perActualCount}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.projectCost.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}