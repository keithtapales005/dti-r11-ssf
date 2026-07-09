"use client"

import { Project } from "@/lib/types/project";
import StatusBadge from "./status-badge";

interface ProjectListTableProps {
    projects: Project[];
    onViewProject: (ssfNumber: string) => void;
    variant: string;
}

export default function ProjectListTable({ projects, onViewProject }: ProjectListTableProps) {

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
                        projects.map((project: any) => (
                            <tr
                                key={project.project_id}
                                className="hover:bg-slate-50/80 transition-colors duration-150 group"
                            >
                                <td className="p-4 font-bold text-secondary-blue whitespace-nowrap">
                                    <span
                                        onClick={() => onViewProject(project.ssf_number)}
                                        className="cursor-pointer hover:underline underline-offset-2 hover:text-blue-700"
                                    >
                                        {project.ssf_number}
                                    </span>
                                </td>

                                <td className="p-4 max-w-[420px]">
                                    <div className="font-bold text-gray-900 leading-snug truncate group-hover:text-clip group-hover:whitespace-normal">
                                        {project.business_name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium line-clamp-1 group-hover:line-clamp-none">
                                        {project.project_title}
                                    </div>
                                </td>

                                <td className="p-4 text-center whitespace-nowrap">
                                    <div className="inline-flex justify-center w-full">
                                        <StatusBadge status={project.project_status?.status_name ?? "Unknown"} />
                                    </div>
                                </td>

                                <td className="p-4 text-xs whitespace-nowrap">
                                    <div className="text-gray-400 font-medium mt-0.5">
                                        {project.updated_at ? new Date(project.updated_at).toLocaleString() : "—"}
                                    </div>
                                </td>

                                <td className="p-4 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => onViewProject(project.ssf_number)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#182286] bg-slate-50 border border-slate-200 group-hover:bg-[#182286] group-hover:text-white group-hover:border-[#182286] px-3 py-1.5 rounded-md transition-all duration-200 shadow-2xs"
                                    >
                                        View Details
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