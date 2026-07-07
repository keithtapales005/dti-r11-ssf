"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Global Shared Components
import SearchBar from "@/app/components/search-bar";
import Pagination from "@/app/components/pagination";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import InputForms from "@/app/components/input-forms";
import InputField from "@/app/components/input-field";
import { ConfirmationModal } from "@/app/components/confirmation-modal";
import { PlusIcon, ChevronLeftIcon } from "@/app/components/icons";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import Footer from "@/app/components/footer";
import Dropdown, { DropdownOption } from "@/app/components/dropdown";
import StatusBadge, { type StatusBadgeProps, STATUS_CONFIG } from "@/app/components/status-badge";

export type ProjectStatus = StatusBadgeProps["status"];

export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG) as ProjectStatus[];

import ProjectListTable from "../../components/project-list-table";

export interface Project {
  id: string;
  year: number;
  ssfNumber: string;
  businessName: string;
  projectTitle: string;
  filesCount: number;
  status: ProjectStatus;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

// Mock Array Data - Implement backend integration and dynamic fetching logic as needed.
const MOCK_PROJECT_DATA: Project[] = [
  {
    id: "1",
    year: 2013,
    ssfNumber: "2013-XI-DVO-0001",
    businessName: "Davao City Chamber of Commerce and Industry, Inc.",
    projectTitle: "SSF-Enterprise Development Center",
    filesCount: 12,
    status: "Ongoing",
    lastUpdatedBy: "Superadmin Account",
    lastUpdatedAt: "May 23, 2026 - 10:00AM",
  },
  {
    id: "2",
    year: 2024,
    ssfNumber: "2024-XI-DVO-0042",
    businessName: "UP Mindanao Food Processing Facility",
    projectTitle: "Shared Service Facility for Food Innovation",
    filesCount: 4,
    status: "Established - Operational",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "Jun 12, 2026 - 02:30PM",
  },
];

export default function ProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provinceName = searchParams.get("province") || "Davao City";

  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECT_DATA);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<string | number>();
  const [selectedYear, setSelectedYear] = useState<string | number>();
  const [year, setYear] = useState("");
const [region, setRegion] = useState("XI");
const [province, setProvince] = useState("");
const [number, setNumber] = useState("");
const [businessName, setBusinessName] = useState("");
const [projectTitle, setProjectTitle] = useState("");
const [proposedBy, setProposedBy] = useState("");
const [status, setStatus] = useState("Proposed");
const [projectCost, setProjectCost] = useState("");

  const statusOptions: DropdownOption[] = [
  { id: "all", label: "All Status", value: "all" },
  { id: "ongoing", label: "Ongoing", value: "Ongoing" },
  { id: "established", label: "Currently Established", value: "Currently Established" },
  { id: "operational", label: "Established - Operational", value: "Established - Operational" },
  { id: "partial", label: "Established - Partially Operational", value: "Established - Partially Operational" },
  { id: "nonoperational", label: "Established - Non-Operational", value: "Established - Non-Operational" },
  { id: "extended", label: "Extended", value: "Extended" },
  { id: "transferred", label: "Transferred", value: "Transferred" },
  { id: "fulltransferred", label: "Fully Transferred", value: "Fully Transferred" },
  { id: "disposed", label: "Disposed", value: "Disposed" },
  { id: "approval", label: "For Approval", value: "For Approval" },
  ];

// Sample. Accomodate for all years
  const yearOptions: DropdownOption[] = [
    { id: 2026, label: "2026", value: 2026 },
    { id: 2025, label: "2025", value: 2025 },
    { id: 2024, label: "2024", value: 2024 },
  ];
  const filteredProjects = useMemo(() => {
  return projects.filter((project) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      project.ssfNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      !selectedStatus ||
      selectedStatus === "all" ||
      project.status === selectedStatus;

    const matchesYear =
      !selectedYear ||
      project.year === Number(selectedYear);

    return matchesSearch && matchesStatus && matchesYear;
  });
}, [projects, searchQuery, selectedStatus, selectedYear]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Always reset page bounds to index 1 on key mutations
  };

  const handleYearChange = (year: string) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    alert("Add Project layout activation intercept triggered! Wire your custom modal here.");
  };

  const handleNavigateToDetails = (ssfNumber: string) => {
    // Encodes spaces/special characters to match cleaner path parameter constraints
    router.push(`/projects/${encodeURIComponent(ssfNumber)}`);
  };

  return (
  <>
    <div className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] p-6">
      <div className="max-w-[1250px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-blue">
            Provinces &gt; <span>{provinceName}</span>
          </h1>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search projects..."
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Dropdown
              options={statusOptions}
              placeholder="Status"
              selectedValue={selectedStatus}
              onSelect={(option) => setSelectedStatus(option.value)}
            />

            <Dropdown
              options={yearOptions}
              placeholder="Year"
              selectedValue={selectedYear}
              onSelect={(option) => setSelectedYear(option.value)}
            />
          </div>

          <DynamicButton
            label="Add Project"
            variant="blue"
            icon={<PlusIcon size={16} stroke="#FEFEFE" strokeWidth={2} />}
            iconPosition="left"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-xs overflow-hidden">
          <ProjectListTable
            projects={filteredProjects}
            onViewProject={handleNavigateToDetails}
            variant="string"
          />
        </div>
      </div>
    </div>

    {/* ADD PROJECT MODAL */}
    {isAddModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <InputForms
      title="New Project"
      onCancel={() => setIsAddModalOpen(false)}
      onSecondaryAction={() => setIsAddModalOpen(false)}
      secondaryButtonLabel="Cancel"
      buttonLabel="Add Project"
      onSubmit={() => {
      const newProject: Project = {
        id: Date.now().toString(),
        year: Number(year),
        ssfNumber: `${year}-${region}-${province}-${number}`,
        businessName,
        projectTitle,
        filesCount: 0,
        status: status as ProjectStatus,
        lastUpdatedBy: "Current User",
        lastUpdatedAt: new Date().toLocaleString(),
      };

      setProjects((prev) => [...prev, newProject]);

      setIsAddModalOpen(false);

      // Optional: clear fields
      setYear("");
      setRegion("XI");
      setProvince("");
      setNumber("");
      setBusinessName("");
      setProjectTitle("");
      setProposedBy("");
      setStatus("Proposed");
      setProjectCost("");
    }}
    >
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Year"
          name="year"
          placeholder="YYYY"
          value={year}
          onChange={setYear}
        />

        <InputField
          label="Region"
          name="region"
          placeholder="XI"
          value={region}
          onChange={setRegion}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Province"
          name="province"
          placeholder="Province"
          value={province}
          onChange={setProvince}
        />

        <InputField
          label="Number"
          name="number"
          placeholder="XXXX"
          value={number}
          onChange={setNumber}
        />
      </div>

      <InputField
        label="Business Name"
        name="businessName"
        placeholder="Enter business name"
        value={businessName}
        onChange={setBusinessName}
      />

      <InputField
        label="Project Title"
        name="projectTitle"
        placeholder="Enter project title"
        value={projectTitle}
        onChange={setProjectTitle}
      />

      <InputField
        label="Proposed By"
        name="proposedBy"
        placeholder="Enter name"
        value={proposedBy}
        onChange={setProposedBy}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Status"
          name="status"
          placeholder="Proposed"
          value={status}
          onChange={setStatus}
        />

        <InputField
          label="Project Cost"
          name="projectCost"
          placeholder="Enter amount"
          value={projectCost}
          onChange={setProjectCost}
          type="number"
        />
      </div>
    </InputForms>
  </div>
    )}
  </>
);
}