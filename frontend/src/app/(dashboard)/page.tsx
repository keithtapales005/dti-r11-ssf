"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  useDashboardSummary,
  useStatusBreakdown,
  useProvinceBreakdown,
  useCostTrend,
  useIndustryBreakdown,
} from "../../lib/queries/dashboardQueries";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];

export default function Home() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: statusData, isLoading: statusLoading } = useStatusBreakdown();
  const { data: provinceData, isLoading: provinceLoading } = useProvinceBreakdown();
  const { data: costData, isLoading: costLoading } = useCostTrend();
  const { data: industryData, isLoading: industryLoading } = useIndustryBreakdown();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="relative min-h-screen bg-[#F3F4F6]">
      <main className="min-w-0 w-full px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total projects" value={summary?.totalProjects} loading={summaryLoading} />
            <StatCard label="Pending approvals" value={summary?.pendingApprovals} loading={summaryLoading} />
            <StatCard label="Active concerns" value={summary?.activeConcerns} loading={summaryLoading} />
            <StatCard
              label="Total project cost"
              value={summary ? formatCurrency(summary.totalCost) : undefined}
              loading={summaryLoading}
            />
          </div>

          {/* Row: status + province */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            <ChartCard title="Projects by status" loading={statusLoading}>
              {statusData && (
                <Bar
                  data={{
                    labels: statusData.map((d) => d.status),
                    datasets: [
                      {
                        data: statusData.map((d) => d.count),
                        backgroundColor: "#2a78d6",
                        borderRadius: 4,
                        maxBarThickness: 28,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              )}
            </ChartCard>

            <ChartCard title="Projects by province" loading={provinceLoading}>
              {provinceData && (
                <Bar
                  data={{
                    labels: provinceData.map((d) => d.province),
                    datasets: [
                      {
                        data: provinceData.map((d) => d.count),
                        backgroundColor: "#1baf7a",
                        borderRadius: 4,
                        maxBarThickness: 28,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              )}
            </ChartCard>
          </div>

          {/* Row: cost trend + industry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ChartCard title="Project cost trend by year" loading={costLoading}>
              {costData && (
                <Line
                  data={{
                    labels: costData.map((d) => d.year.toString()),
                    datasets: [
                      {
                        data: costData.map((d) => d.totalCost),
                        borderColor: "#2a78d6",
                        backgroundColor: "rgba(42,120,214,0.1)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: "#2a78d6",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              )}
            </ChartCard>

            <ChartCard title="Projects by industry" loading={industryLoading}>
              {industryData && (
                <Doughnut
                  data={{
                    labels: industryData.map((d) => d.industry),
                    datasets: [
                      {
                        data: industryData.map((d) => d.count),
                        backgroundColor: SERIES_COLORS,
                        borderColor: "#ffffff",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" as const } },
                  }}
                />
              )}
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number | undefined;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">
        {loading ? "…" : value ?? "-"}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
      <div className="relative h-[220px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading…
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}