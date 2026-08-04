"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/queries/projectQueries";
import { useSupplies } from "@/lib/queries/supplyQueries";
import { useConcerns } from "@/lib/queries/concernQueries";
import { useEditProject, useDeleteProject } from "@/lib/mutations/projectMutation";
import { useProjectStatuses } from "@/lib/queries/projectStatusQueries";
import { ProjectCardDetails } from "@/app/components/project-card-details";
import { ConfirmationModal } from "@/app/components/confirmation-modal";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { useCallback } from "react";
import ProjectSupplyTable from "@/app/components/project-supply-table";
import ProjectConcernList from "@/app/components/project-concern-list";
import ProjectFileList from "@/app/components/project-file-list";
import { useFilesByProject } from "@/lib/queries/fileQueries";
import { useChecklistByProject } from "@/lib/queries/checklistQueries";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: supplies, isLoading: suppliesLoading } = useSupplies(projectId);
  const { data: concerns, isLoading: concernsLoading } = useConcerns(projectId);
  const { data: statuses } = useProjectStatuses();
  const { data: files, isLoading: filesLoading } = useFilesByProject(projectId);
  const { data: checklistData, isLoading: checklistLoading } = useChecklistByProject(projectId);

  const editProject = useEditProject();
  const deleteProject = useDeleteProject();

  const [activeTab, setActiveTab] = useState<"supplies" | "concerns" | "files">("files");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (projectLoading) {
    return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-gray-500">Project not found.</div>;
  }

  const handleSave = (updated: {
    ssfNumber: string;
    businessName: string;
    projectTitle: string;
    status: string;
    filesCount: number;
  }) => {
    const matchedStatus = (statuses ?? []).find((s: any) => s.status_name === updated.status);

    editProject.mutate(
      {
        id: projectId,
        dto: {
          ssf_number: updated.ssfNumber,
          business_name: updated.businessName,
          project_title: updated.projectTitle,
          project_status_id: matchedStatus?.project_status_id,
        },
      },
      {
        onSuccess: () => addToast({ type: "success", title: "Project Updated", description: "", duration: 3000 }),
        onError: (error: any) => addToast({ type: "error", title: "Update Failed", description: error?.message, duration: 3000 }),
      }
    );
  };

  const handleConfirmDelete = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        addToast({ type: "success", title: "Project Deleted", description: "", duration: 3000 });
        router.push("/project-page");
      },
      onError: (error: any) => addToast({ type: "error", title: "Delete Failed", description: error?.message, duration: 3000 }),
    });
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] p-6">
      <div className="max-w-[1250px] mx-auto space-y-6">
        <ProjectCardDetails
          projectId={projectId}
          ssfNumber={project.ssf_number}
          businessName={project.business_name}
          projectTitle={project.project_title}
          status={(project.project_status?.status_name ?? "No Status") as any}
          filesCount={0}
          isAdminView={true}
          onDelete={() => setIsDeleteOpen(true)}
          onSave={handleSave}
        />

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("files")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === "files" ? "border-[#182286] text-[#182286] bg-white" : "border-transparent text-gray-500 bg-white/60"
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab("supplies")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === "supplies" ? "border-[#182286] text-[#182286] bg-white" : "border-transparent text-gray-500 bg-white/60"
            }`}
          >
            Supplies / Equipment
          </button>
          <button
            onClick={() => setActiveTab("concerns")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === "concerns" ? "border-[#182286] text-[#182286] bg-white" : "border-transparent text-gray-500 bg-white/60"
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
        ) : activeTab === "concerns" ? (
          concernsLoading ? (
            <div className="bg-white rounded-lg p-6 text-gray-500">Loading concerns...</div>
          ) : (
            <ProjectConcernList projectId={projectId} concerns={concerns ?? []} />
          )
        ) : filesLoading || checklistLoading ? (
          <div className="bg-white rounded-lg p-6 text-gray-500">Loading files...</div>
        ) : (
          <ProjectFileList projectId={projectId} files={files ?? []} checklistData={checklistData} />
        )}
      </div>

      {isDeleteOpen && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Project"
          message="Delete this project? This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel="Delete Project"
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            setIsDeleteOpen(false);
            handleConfirmDelete();
          }}
          loading={deleteProject.isPending}
          disabled={deleteProject.isPending}
        />
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </div>
  );
}