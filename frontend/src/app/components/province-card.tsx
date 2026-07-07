"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, CalendarIcon } from "@/app/components/icons";
import { DynamicButton } from "@/app/components/dynamic-buttons";
/* =========================
   TYPES
========================= */

export interface ProvinceCardProps {
  provinceName: string;
  projectCount: number;
  lastUpdated: string;
  onViewProjects?: () => void;
}

/* =========================
   FOLDER ICON
========================= */

const FolderIcon = () => (
  <div className="w-26 h-26 relative">
    <div className="w-26 h-18 absolute top-7.75 bg-stone-300 rounded-[10px]" />
    <div className="w-26 h-18 absolute top-1.75 bg-indigo-600 rounded-[10px]" />
    <div className="w-26 h-18 absolute top-3 bg-indigo-700 rounded-[10px]" />
    <div className="w-12 h-4 absolute top-0 bg-indigo-600 rounded-[10px]" />
    <div className="w-12 h-4 absolute top-1.25 bg-indigo-700 rounded-[10px]" />
    <div className="w-26 h-18 absolute top-5.25 rounded-[20px] bg-[#4153FF]" />
    <div className="w-22 h-5 absolute left-2.25 top-4.25 rounded-[10px] bg-gray-200" />
    <div className="w-26 h-18 absolute top-6.75 rounded-[10px] bg-blue-600" />
  </div>
);

/* =========================
   PROVINCE CARD
========================= */

export const ProvinceCard: React.FC<ProvinceCardProps> = ({
  provinceName,
  projectCount,
  lastUpdated,
  onViewProjects,
}) => {
  const router = useRouter();

  const handleViewProjects = () => {
    if (onViewProjects) {
      onViewProjects();
      return;
    }

    router.push(`/project-page?province=${encodeURIComponent(provinceName)}`);
  };

  return (
    <div>
      <div className="w-101.25 h-54.75 px-7.5 pt-8 pb-5 bg-white rounded-xl shadow-md flex flex-col gap-2">
        {/* ================= HEADER CONTAINER ================= */}
        <div></div>
        <div className="flex items-start gap-6">
          {/* ICON CONTAINER */}
          <div className="shrink-0 flex items-center justify-center">
            <FolderIcon />
          </div>

          {/* TEXT CONTAINER */}
          <div className="flex flex-col justify-between h-26">
            {/* Province Name */}
            <div>
              <h3 className="text-lg font-semibold text-[#121B29]">
                {provinceName}
              </h3>
            </div>

            {/* Project Count */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold font-['Inter'] text-[#2563EB]">
                  {projectCount}
                </span>
                <span className="text-base h-6.5 font-semibold text-[#6D7380]">
                  Projects
                </span>
              </div>
              {/* Last Updated */}
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={12} stroke="#6D7380" strokeWidth={2} />
                <span className="text-[10px] pt-0.5 font-medium text-[#6D7380]">
                  Last updated: {lastUpdated}
                </span>
              </div>{" "}
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-gray-200 mt-2" />

        {/* ================= BUTTON ================= */}
        <div className="flex justify-center">
          <DynamicButton
            label="View Projects"
            variant="clear"
            iconPosition="right"
            icon={
              <ChevronRightIcon size={12} stroke="#182286" strokeWidth={3} />
            }
            onClick={handleViewProjects}
            className="p-0"
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default ProvinceCard;
