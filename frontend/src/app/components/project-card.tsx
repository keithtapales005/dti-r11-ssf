"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, FileIcon } from "@/app/components/icons";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import StatusBadge from "@/app/components/status-badge";

export interface ProjectCardProps {
  projectId: number;
  provinceName: string;
  ssfNumber: string;
  businessName: string;
  projectTitle: string;
  filesCount: number;
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
  onViewFiles?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectId,
  provinceName,
  ssfNumber = "year-XI-DVC-0000", // Placeholder for backend readiness
  businessName,
  projectTitle,
  filesCount,
  status,
  onViewFiles,
}) => {
  const router = useRouter();

  // Extract year, region, province, and number from SSF number
  const [year, region, province, number] = ssfNumber.split("-");

  const handleViewFiles = () => {
    if (onViewFiles) {
      onViewFiles();
      return;
    }

    router.push(
      `/file-page?projectId=${projectId}&province=${encodeURIComponent(provinceName)}&ssfNumber=${encodeURIComponent(ssfNumber)}&businessName=${encodeURIComponent(businessName)}&projectTitle=${encodeURIComponent(projectTitle)}&status=${encodeURIComponent(status)}&filesCount=${filesCount}`,
    );
  };

  return (
    <div className="w-101.25 h-45 pt-5 pb-4 bg-white rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col justify-between">
      {/* TOP */}
      <div className="w-91.8 h-29.5 px-5 flex flex-col gap-4">
        <div className="flex flex-col gap-7">
          <div className="flex justify-between items-center">
            {/* Display formatted SSF Number */}
            <div className="text-[#182286] text-lg font-semibold">
              {`${year}-${region}-${province}-${number}`}
            </div>

            <StatusBadge status={status} size="default" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-[#2563EB] text-sm font-bold">
              {businessName}
            </div>

            <div className="text-xs text-black">
              <span className="font-bold">Project Title: </span>
              <span className="font-normal">{projectTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-full border-t border-[#DDDDDD]" />

      {/* BOTTOM */}
      <div className="w-full h-7 pl-5 flex flex-col gap-5 justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <FileIcon size={12} stroke="#121B29" strokeWidth={2} />
            <span className="text-[12px] h-4.2 text-[#121B29]">
              {filesCount} Files
            </span>
          </div>

          <DynamicButton
            label="View Files"
            variant="clear"
            iconPosition="right"
            icon={
              <ChevronRightIcon size={12} stroke="#2563EB" strokeWidth={3} />
            }
            onClick={handleViewFiles}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;