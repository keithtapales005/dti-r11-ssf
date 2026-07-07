"use client"

import { Project } from "@/app/(dashboard)/project-page/page"
import StatusBadge from "./status-badge";
import { useState } from "react";

interface ProjectListTableProps {
    projects: Project[];
    onViewProject: (ssfNumber: string) => void;
    variant: string;
}

export default function ProjectListTable({ projects, onViewProject }: ProjectListTableProps) {
    
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-xs">

            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-primary-blue text-white text-base">
                        <th className="p-4 tracking-wide rounded-tl-lg font-normal">SSF No.</th>
                        <th className="p-4 tracking-wide font-normal">Coordinator / Project Title</th>
                        <th className="p-4 tracking-wide text-center font-normal">Status</th>
                        <th className="p-4 tracking-wide font-normal">Last Updated</th>
                        <th className="p-4 tracking-wide text-right rounded-tr-lg font-normal">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {projects.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                                No active projects found.
                            </td>
                        </tr>
                    ) : (
                        projects.map((project) => (
                            <tr 
                                key={project.ssfNumber} // 💡 Fixed to camelCase
                                className="hover:bg-slate-50/80 transition-colors duration-150 group"
                            >
                                {/* SSF Number Code Anchor */}
                                <td className="p-4 font-bold text-secondary-blue whitespace-nowrap">
                                    <span 
                                        onClick={() => onViewProject(project.ssfNumber)} // 💡 Fixed to camelCase
                                        className="cursor-pointer hover:underline underline-offset-2 hover:text-blue-700"
                                    >
                                        {project.ssfNumber} 
                                    </span>
                                </td>
                                
                                {/* Agency Title & Subtext Details */}
                                <td className="p-4 max-w-[420px]">
                                    <div className="font-bold text-gray-900 leading-snug truncate group-hover:text-clip group-hover:whitespace-normal">
                                        {project.businessName} 
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium line-clamp-1 group-hover:line-clamp-none">
                                        {project.projectTitle} 
                                    </div>
                                </td>
                                
                                {/* Status Badges Group using your Shared Component */}
                                <td className="p-4 text-center whitespace-nowrap">
                                    <div className="inline-flex justify-center w-full">
                                        <StatusBadge status={project.status}/>
                                    </div>
                                </td>
                                
                                {/* Timestamp Metrics Block */}
                                <td className="p-4 text-xs whitespace-nowrap">
                                    {/* 💡 Fixed to camelCase properties */}
                                    <div className="font-semibold text-gray-800">{project.lastUpdatedBy}</div>
                                    <div className="text-gray-400 font-medium mt-0.5">{project.lastUpdatedAt}</div>
                                </td>
                                
                                {/* Interactive Action Trigger */}
                                <td className="p-4 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => onViewProject(project.ssfNumber)} 
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#182286] bg-slate-50 border border-slate-200 group-hover:bg-[#182286] group-hover:text-white group-hover:border-[#182286] px-3 py-1.5 rounded-md transition-all duration-200 shadow-2xs"
                                    >
                                        View Details
                                        <span className="text-[10px] transform transition-transform duration-200 group-hover:translate-x-0.5">❯</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}