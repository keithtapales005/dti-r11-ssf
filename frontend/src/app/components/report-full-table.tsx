import { ProvinceRow } from "@/lib/types/report";

interface ReportFullTableProps {
  rows: ProvinceRow[];
}

export default function ReportFullTable({ rows }: ReportFullTableProps) {
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
            <th rowSpan={2} className="px-3 py-2 border border-white/20 align-middle">Total Amount Disbursed</th>
            <th colSpan={4} className="px-3 py-2 border border-white/20">Status (Per Fund Source)</th>
            <th colSpan={4} className="px-3 py-2 border border-white/20">Status (Per Actual Count)</th>
            <th colSpan={2} className="px-3 py-2 border border-white/20">MSMEs Assisted</th>
            <th colSpan={2} className="px-3 py-2 border border-white/20">Other Users Assisted</th>
            <th colSpan={2} className="px-3 py-2 border border-white/20">Employment Generated</th>
            <th rowSpan={2} className="px-3 py-2 border border-white/20 align-middle">Sales Generated</th>
            <th rowSpan={2} className="px-3 py-2 border border-white/20 align-middle">Income Generated</th>
          </tr>
          <tr className="bg-[#182286] text-white">
            <th className="px-3 py-2 border border-white/20">Per Fund Source</th>
            <th className="px-3 py-2 border border-white/20">Per Actual Count</th>
            <th className="px-3 py-2 border border-white/20">Fully Op.</th>
            <th className="px-3 py-2 border border-white/20">Partially Op.</th>
            <th className="px-3 py-2 border border-white/20">Non-Op.</th>
            <th className="px-3 py-2 border border-white/20">% Op.</th>
            <th className="px-3 py-2 border border-white/20">Fully Op.</th>
            <th className="px-3 py-2 border border-white/20">Partially Op.</th>
            <th className="px-3 py-2 border border-white/20">Non-Op.</th>
            <th className="px-3 py-2 border border-white/20">% Op.</th>
            <th className="px-3 py-2 border border-white/20">Male</th>
            <th className="px-3 py-2 border border-white/20">Female</th>
            <th className="px-3 py-2 border border-white/20">Male</th>
            <th className="px-3 py-2 border border-white/20">Female</th>
            <th className="px-3 py-2 border border-white/20">Male</th>
            <th className="px-3 py-2 border border-white/20">Female</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.province} className="text-center even:bg-gray-50">
              <td className="px-3 py-2 border border-gray-200 text-left font-medium text-gray-800">{row.province}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.perFundSource}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.perActualCount}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.totalAmountDisbursed.toLocaleString()}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.fullyOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.partiallyOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.nonOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{(row.percentOperational * 100).toFixed(0)}%</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.fullyOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.partiallyOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.nonOperational}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{(row.percentOperational * 100).toFixed(0)}%</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.msmesMale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.msmesFemale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.otherUsersMale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.otherUsersFemale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.employmentMale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.employmentFemale}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.salesGenerated.toLocaleString()}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.incomeGenerated.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}