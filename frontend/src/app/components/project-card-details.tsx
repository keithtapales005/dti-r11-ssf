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

/* =========================
   TYPES
========================= */

export interface ProjectCardDetailsProps {
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
  }) => void;
}

const PROJECT_UPDATES_STORAGE_KEY = "ssf-project-updates";

/* =========================
   PROJECT CARD DETAILS COMPONENT
========================= */

export const ProjectCardDetails: React.FC<ProjectCardDetailsProps> = ({
  ssfNumber = "year-XI-DVC-0000",
  businessName,
  projectTitle,
  status,
  filesCount,
  isAdminView = false,
  onEdit,
  onDelete,
  onSave,
}) => {
  const [year = "", region = "XI", province = "DVC", number = ""] = ssfNumber.split("-");
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [editForm, setEditForm] = useState({
    year,
    region,
    province,
    code: number,
    businessName,
    projectTitle,
    status,
  });
  const [cardDetails, setCardDetails] = useState({
    ssfNumber,
    businessName,
    projectTitle,
    status,
    filesCount,
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
    });
    setCardDetails({
      ssfNumber,
      businessName,
      projectTitle,
      status,
      filesCount,
    });
  }, [year, region, province, number, businessName, projectTitle, status]);

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
    if (typeof window === "undefined") {
      return;
    }

    const updatedProject = {
      id: ssfNumber,
      ssfNumber: editSsfNumber,
      businessName: editForm.businessName,
      projectTitle: editForm.projectTitle,
      status: editForm.status,
      filesCount,
    };

    const stored = window.localStorage.getItem(PROJECT_UPDATES_STORAGE_KEY);
    const projects = stored ? (JSON.parse(stored) as Array<typeof updatedProject>) : [];
    const nextProjects = projects.filter((project) => project.id !== ssfNumber);

    window.localStorage.setItem(
      PROJECT_UPDATES_STORAGE_KEY,
      JSON.stringify([...nextProjects, updatedProject]),
    );

    setCardDetails(updatedProject);
    onSave?.(updatedProject);
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

            </div>
          </InputForms>
        </div>
      )}
    </>
  );
};

export default ProjectCardDetails;
