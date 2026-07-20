"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@/app/components/icons";
import StatusBadge from "@/app/components/status-badge";
import InputField from "@/app/components/input-field";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import InputForms from "@/app/components/input-forms";
import Dropdown, { type DropdownOption } from "@/app/components/dropdown";
import { useUpdateProject } from "@/lib/mutations/projectMutation";

/* =========================
   TYPES
========================= */

export interface ProjectCardDetailsProps {
  projectId: number;
  ssfNumber: string;
  businessName: string;
  projectTitle: string;
  status:
    | "Approved"
    | "Established"
    | "Operational"
    | "Partially Operational"
    | "Non-Operational"
    | "Extended"
    | "Transferred"
    | "Fully Transferred"
    | "Disposed"
    | "No Status";
  filesCount: number;
  yearLaunched?: number | null;
  dateEstablished?: string | null;
  industry?: string | null;
  projectCost?: number | null;
  isAdminView?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: (project: {
    ssfNumber: string;
    businessName: string;
    projectTitle: string;
    status:
      | "Approved"
      | "Established"
      | "Operational"
      | "Partially Operational"
      | "Non-Operational"
      | "Extended"
      | "Transferred"
      | "Fully Transferred"
      | "Disposed"
      | "No Status";
    filesCount: number;
    yearLaunched?: number | null;
    dateEstablished?: string | null;
    industry?: string | null;
    projectCost?: number | null;
  }) => void;
}

const PROJECT_UPDATES_STORAGE_KEY = "ssf-project-updates";

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* =========================
   PROJECT CARD DETAILS COMPONENT
========================= */

export const ProjectCardDetails: React.FC<ProjectCardDetailsProps> = ({
  projectId,
  ssfNumber = "year-XI-DVC-0000",
  businessName,
  projectTitle,
  status,
  filesCount,
  yearLaunched,
  dateEstablished,
  industry,
  projectCost,
  isAdminView = false,
  onEdit,
  onDelete,
  onSave,
}) => {
  const [year = "", region = "XI", province = "DVC", number = ""] = ssfNumber.split("-");
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const updateProject = useUpdateProject();
  const [editForm, setEditForm] = useState({
    year,
    region,
    province,
    code: number,
    businessName,
    projectTitle,
    status,
    yearLaunched: yearLaunched ? String(yearLaunched) : "",
    dateEstablished: dateEstablished ?? "",
    industry: industry ?? "",
    projectCost: projectCost !== null && projectCost !== undefined ? String(projectCost) : "",
  });
  const [cardDetails, setCardDetails] = useState({
    ssfNumber,
    businessName,
    projectTitle,
    status,
    filesCount,
    yearLaunched,
    dateEstablished,
    industry,
    projectCost,
  });

  const provinceOptions: DropdownOption[] = [
    { id: "Davao City", label: "DVO - Davao City", value: "DVO" },
    { id: "Davao de Oro", label: "DDO - Davao de Oro", value: "DDO" },
    { id: "Davao del Norte", label: "DVN - Davao del Norte", value: "DVN" },
    { id: "Davao del Sur", label: "DDS - Davao del Sur", value: "DDS" },
    { id: "Davao Occidental", label: "DVC - Davao Occidental", value: "DVC" },
    { id: "Davao Oriental", label: "DVR - Davao Oriental", value: "DVR" },
  ];

  const statusOptions: DropdownOption[] = [
    { id: "Approved", label: "Approved", value: "Approved" },
    { id: "Established", label: "Established", value: "Established" },
    { id: "Operational", label: "Operational", value: "Operational" },
    {
      id: "Partially Operational",
      label: "Partially Operational",
      value: "Partially Operational",
    },
    { id: "Non-Operational", label: "Non-Operational", value: "Non-Operational" },
    { id: "Extended", label: "Extended", value: "Extended" },
    { id: "Transferred", label: "Transferred", value: "Transferred" },
    {
      id: "Fully Transferred",
      label: "Fully Transferred",
      value: "Fully Transferred",
    },
    { id: "Disposed", label: "Disposed", value: "Disposed" },
    { id: "No Status", label: "No Status", value: "No Status" },
  ];

  const editSsfNumber = `${editForm.year}-${editForm.region}-${editForm.province}-${editForm.code || "0000"}`;

  useEffect(() => {
    setEditForm({
      year,
      region,
      province,
      code: number,
      businessName,
      projectTitle,
      status,
      yearLaunched: yearLaunched ? String(yearLaunched) : "",
      dateEstablished: dateEstablished ?? "",
      industry: industry ?? "",
      projectCost: projectCost !== null && projectCost !== undefined ? String(projectCost) : "",
    });
    setCardDetails({
      ssfNumber,
      businessName,
      projectTitle,
      status,
      filesCount,
      yearLaunched,
      dateEstablished,
      industry,
      projectCost,
    });
  }, [year, region, province, number, businessName, projectTitle, status, yearLaunched, dateEstablished, industry, projectCost, filesCount, ssfNumber]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenEdit = () => {
    setIsActionsOpen(false);
    setIsEditOpen(true);
    onEdit?.();
  };

  const persistProjectDetails = () => {
    const updatedProject = {
      id: ssfNumber,
      ssfNumber: editSsfNumber,
      businessName: editForm.businessName,
      projectTitle: editForm.projectTitle,
      status: editForm.status,
      filesCount,
      yearLaunched: editForm.yearLaunched ? Number(editForm.yearLaunched) : null,
      dateEstablished: editForm.dateEstablished || null,
      industry: editForm.industry || null,
      projectCost: editForm.projectCost ? Number(editForm.projectCost) : null,
    };

    updateProject.mutate(
      {
        id: projectId,
        dto: {
          business_name: editForm.businessName,
          project_title: editForm.projectTitle,
          year_launched: updatedProject.yearLaunched ?? undefined,
          date_established: updatedProject.dateEstablished ?? undefined,
          industry: updatedProject.industry ?? undefined,
          project_cost: updatedProject.projectCost ?? undefined,
        },
      },
      {
        onSuccess: () => {
          setCardDetails(updatedProject);
          onSave?.(updatedProject);
        },
      },
    );
  };

  const handleDelete = () => {
    setIsActionsOpen(false);
    onDelete?.();
  };

  return (
    <>
      <div className="w-[1280px] px-7 py-10 bg-white rounded-[10px] inline-flex flex-col justify-center items-center gap-2.5">
        <div className="w-[1224px] inline-flex justify-start items-stretch">
          {/* Left Section - SSF Info */}
          <div className="w-[920px] inline-flex flex-col justify-start items-start gap-5">
          {/* SSF No. */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div
              className="self-stretch justify-start text-lg font-semibold font-['Inter']"
              style={{ color: "#6D7380" }}
            >
              SSF No.
            </div>
            <div
              className="self-stretch justify-start text-2xl font-semibold font-['Inter']"
              style={{ color: "#2563EB" }}
            >
              {cardDetails.ssfNumber}
            </div>
          </div>

          {/* Business Name */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div
              className="self-stretch justify-start text-lg font-semibold font-['Inter']"
              style={{ color: "#6D7380" }}
            >
              Business Name
            </div>
            <div className="self-stretch justify-start text-2xl font-bold font-['Inter'] text-black">
              {cardDetails.businessName}
            </div>
          </div>

          {/* Project Title */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div
              className="self-stretch justify-start text-lg font-semibold font-['Inter']"
              style={{ color: "#6D7380" }}
            >
              Project Title
            </div>
            <div className="self-stretch justify-start text-2xl font-bold font-['Inter'] text-black">
              {cardDetails.projectTitle}
            </div>
          </div>

          {/* Additional Details Row: Year Launched, Date Established, Industry, Project Cost */}
          <div className="self-stretch grid grid-cols-2 gap-5 pt-2">
            <div className="flex flex-col justify-start items-start gap-2">
              <div
                className="self-stretch justify-start text-sm font-semibold font-['Inter']"
                style={{ color: "#6D7380" }}
              >
                Year Launched
              </div>
              <div className="self-stretch justify-start text-base font-semibold font-['Inter'] text-black">
                {cardDetails.yearLaunched ?? "—"}
              </div>
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div
                className="self-stretch justify-start text-sm font-semibold font-['Inter']"
                style={{ color: "#6D7380" }}
              >
                Date Established
              </div>
              <div className="self-stretch justify-start text-base font-semibold font-['Inter'] text-black">
                {formatDate(cardDetails.dateEstablished)}
              </div>
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div
                className="self-stretch justify-start text-sm font-semibold font-['Inter']"
                style={{ color: "#6D7380" }}
              >
                Industry
              </div>
              <div className="self-stretch justify-start text-base font-semibold font-['Inter'] text-black">
                {cardDetails.industry ?? "—"}
              </div>
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div
                className="self-stretch justify-start text-sm font-semibold font-['Inter']"
                style={{ color: "#6D7380" }}
              >
                Project Cost
              </div>
              <div className="self-stretch justify-start text-base font-semibold font-['Inter'] text-black">
                {formatCurrency(cardDetails.projectCost)}
              </div>
            </div>
          </div>
        </div>

          {/* Divider and Right Section */}
          <div className="flex-1 flex justify-start items-stretch gap-14">
            {/* Vertical Divider */}
            <div className="w-0.5 self-stretch" style={{ backgroundColor: "#DDDDDD" }}></div>

            {/* Right Section - Status, Files, Actions */}
            <div className="relative w-56 self-stretch flex flex-col items-start">
              {/* Action Menu - Only visible in admin view */}
              {isAdminView && (
                <div className="absolute right-0 top-0" ref={actionsRef}>
                  <button
                    type="button"
                    onClick={() => setIsActionsOpen((current) => !current)}
                    aria-label="Project actions"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D1D5DB] bg-white text-[#182286] transition-colors hover:bg-[#F3F4F6]"
                  >
                    <MoreVerticalIcon size={18} stroke="#182286" strokeWidth={2} />
                  </button>

                  {isActionsOpen && (
                    <div className="absolute right-0 top-12 z-20 min-w-44 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.14)]">
                      <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#182286] transition-colors hover:bg-[#EEF2FF]"
                      >
                        <PencilIcon size={16} stroke="#2563EB" strokeWidth={2} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#DC2636] transition-colors hover:bg-[#FEF2F2]"
                      >
                        <TrashIcon size={16} stroke="#DC2636" strokeWidth={2} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex min-h-[240px] w-full flex-1 flex-col items-start justify-center gap-5 pt-12">
                {/* Status */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div
                    className="self-stretch justify-start text-lg font-semibold font-['Inter']"
                    style={{ color: "#6D7380" }}
                  >
                    Status
                  </div>
                  <StatusBadge status={cardDetails.status} variant="large" />
                </div>

                {/* Files */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div
                    className="self-stretch justify-start text-lg font-semibold font-['Inter']"
                    style={{ color: "#6D7380" }}
                  >
                    Files
                  </div>
                  <div className="self-stretch justify-start text-2xl font-bold font-['Inter'] text-black">
                    {cardDetails.filesCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-details-edit-title"
        >
          <div
            className="absolute inset-0 bg-[#182286]/20 backdrop-blur-[1px]"
            onClick={() => setIsEditOpen(false)}
            aria-hidden="true"
          />

          <InputForms
            title="Edit Project"
            onSubmit={() => {
              persistProjectDetails();
              setIsEditOpen(false);
            }}
            onCancel={() => setIsEditOpen(false)}
            onSecondaryAction={() => {
              setIsEditOpen(false);
              onDelete?.();
            }}
            showCloseButton={true}
            width="666px"
            mode="edit"
            buttonLabel="Save Changes"
            secondaryButtonLabel="Delete Project"
            secondaryButtonVariant="red"
          >
            <div className="space-y-5">
              <div className="text-sm font-semibold text-[#182286]">
                SSF Number Details
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Year"
                  name="year"
                  placeholder="YYYY"
                  value={editForm.year}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, year: value }))
                  }
                  required
                  disabled={false}
                  error={undefined}
                  maxLength={4}
                />
                <InputField
                  label="Region"
                  name="region"
                  placeholder="XI"
                  value={editForm.region}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, region: value }))
                  }
                  required
                  disabled
                />
                <Dropdown
                  variant="secondary"
                  label="Province"
                  options={provinceOptions}
                  selectedValue={editForm.province}
                  onSelect={(option) =>
                    setEditForm((current) => ({
                      ...current,
                      province: String(option.value),
                    }))
                  }
                  placeholder="Province"
                  required
                  disabled={false}
                />
                <InputField
                  label="Code"
                  name="code"
                  placeholder="XXXX"
                  value={editForm.code}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, code: value }))
                  }
                  required
                  disabled={false}
                />
              </div>

              <Dropdown
                variant="secondary"
                label="Status"
                options={statusOptions}
                selectedValue={editForm.status}
                onSelect={(option) =>
                  setEditForm((current) => ({
                    ...current,
                    status: String(option.value) as ProjectCardDetailsProps["status"],
                  }))
                }
                placeholder="Select status"
                required
                disabled={false}
              />

              <InputField
                label="Business Name"
                name="businessName"
                placeholder="Enter business name"
                value={editForm.businessName}
                onChange={(value) =>
                  setEditForm((current) => ({ ...current, businessName: value }))
                }
                required
                disabled={false}
              />

              <InputField
                label="Project Title"
                name="projectTitle"
                placeholder="Enter project title"
                value={editForm.projectTitle}
                onChange={(value) =>
                  setEditForm((current) => ({ ...current, projectTitle: value }))
                }
                required
                disabled={false}
              />

              <div className="text-sm font-semibold text-[#182286] pt-2">
                Additional Details
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Year Launched"
                  name="yearLaunched"
                  placeholder="e.g. 2024"
                  value={editForm.yearLaunched}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, yearLaunched: value }))
                  }
                  maxLength={4}
                />
                <InputField
                  label="Date Established"
                  name="dateEstablished"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={editForm.dateEstablished}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, dateEstablished: value }))
                  }
                />
                <InputField
                  label="Industry"
                  name="industry"
                  placeholder="e.g. Manufacturing"
                  value={editForm.industry}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, industry: value }))
                  }
                />
                <InputField
                  label="Project Cost"
                  name="projectCost"
                  type="number"
                  placeholder="e.g. 250000.50"
                  value={editForm.projectCost}
                  onChange={(value) =>
                    setEditForm((current) => ({ ...current, projectCost: value }))
                  }
                />
              </div>
            </div>
          </InputForms>
        </div>
      )}
    </>
  );
};

export default ProjectCardDetails;