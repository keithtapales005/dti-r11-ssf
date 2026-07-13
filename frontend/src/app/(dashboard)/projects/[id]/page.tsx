"use client";

import { use, useState } from "react";
import { useProject } from "@/lib/queries/projectQueries";
import { useSupplies } from "@/lib/queries/supplyQueries";
import { useConcerns } from "@/lib/queries/concernQueries";
import StatusBadge from "@/app/components/status-badge";
import ProjectSupplyTable from "@/app/components/project-supply-table";
import ProjectConcernList from "@/app/components/project-concern-list";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);
  
  const [activeTab, setActiveTab] = useState<"supplies" | "concerns">("supplies");
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: supplies, isLoading: suppliesLoading } = useSupplies(projectId);
  const { data: concerns, isLoading: concernsLoading } = useConcerns(projectId);

  if (projectLoading) {
    return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-gray-500">Project not found.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] p-6">
      <div className="max-w-[1250px] mx-auto space-y-6">
        {/* Project Header Card */}
        <div className="bg-white rounded-[10px] p-7 space-y-5">
          <div>
            <div className="text-lg font-semibold text-[#6D7380]">SSF No.</div>
            <div className="text-2xl font-semibold text-[#2563EB]">{project.ssf_number}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#6D7380]">Business Name</div>
            <div className="text-2xl font-bold text-black">{project.business_name}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#6D7380]">Project Title</div>
            <div className="text-2xl font-bold text-black">{project.project_title}</div>
          </div>
          {project.proposed_by && (
            <div>
              <div className="text-lg font-semibold text-[#6D7380]">Proposed By</div>
              <div className="text-lg font-medium text-black">{project.proposed_by}</div>
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-[#6D7380]">Status</div>
            <StatusBadge status={project.project_status?.status_name ?? "No Status"} variant="large" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("supplies")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === "supplies"
                ? "border-[#182286] text-[#182286] bg-white"
                : "border-transparent text-gray-500 bg-white/60"
            }`}
          >
            Supplies / Equipment
          </button>
          <button
            onClick={() => setActiveTab("concerns")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === "concerns"
                ? "border-[#182286] text-[#182286] bg-white"
                : "border-transparent text-gray-500 bg-white/60"
            }`}
          >
            Comments / Reports
          </button>
        </div>

        {activeTab === "supplies" ? (
          suppliesLoading ? (
            <div className="bg-white rounded-lg p-6 text-gray-500">Loading supplies...</div>
          ) : (
            <ProjectSupplyTable projectId={projectId} supplies={supplies ?? []} />
          )
        ) : (
          concernsLoading ? (
            <div className="bg-white rounded-lg p-6 text-gray-500">Loading concerns...</div>
          ) : (
            <ProjectConcernList projectId={projectId} concerns={concerns ?? []} />
          )
        )}
      </div>
    </div>
  );
}