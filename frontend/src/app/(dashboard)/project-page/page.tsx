"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import SearchBar from "@/app/components/search-bar";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import InputForms from "@/app/components/input-forms";
import InputField from "@/app/components/input-field";
import { PlusIcon } from "@/app/components/icons";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import Dropdown, { DropdownOption } from "@/app/components/dropdown";

import ProjectListTable from "../../components/project-list-table";

import { useProjects } from "@/lib/queries/projectQueries";
import { useCreateProject } from "@/lib/mutations/projectMutation";
import { useProvinces } from "@/lib/queries/provinceQueries";
import { useProjectStatuses } from "@/lib/queries/projectStatusQueries";
import { useCurrentUser } from "@/lib/hooks/useAuth";

export default function ProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provinceName = searchParams.get("province") || "Davao City";

  const { data: currentUser } = useCurrentUser();
  const { data: projectsResponse, isLoading: projectsLoading } = useProjects(1, 50);
  const { data: provinces } = useProvinces();
  const { data: statuses } = useProjectStatuses();
  const createProject = useCreateProject();

  const projects = projectsResponse?.data ?? [];

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string | number>();
  const [selectedYear, setSelectedYear] = useState<string | number>();
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const [year, setYear] = useState("");
  const [region, setRegion] = useState("XI");
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [number, setNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [proposedBy, setProposedBy] = useState("");
  const [statusId, setStatusId] = useState<number | undefined>();

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const statusOptions: DropdownOption[] = useMemo(
    () =>
      (statuses ?? []).map((s: any) => ({
        id: s.project_status_id,
        label: s.status_name,
        value: s.project_status_id,
      })),
    [statuses]
  );

  const provinceOptions: DropdownOption[] = useMemo(
    () =>
      (provinces ?? []).map((p: any) => ({
        id: p.province_id,
        label: p.province_name,
        value: p.province_id,
      })),
    [provinces]
  );

  const currentProvinceId = useMemo(() => {
    return (provinces ?? []).find((p: any) => p.province_name === provinceName)?.province_id;
  }, [provinces, provinceName]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        project.ssf_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !selectedStatus || selectedStatus === "all" || project.project_status_id === selectedStatus;

      const matchesProvince =
        !currentProvinceId || project.province_id === currentProvinceId;

      return matchesSearch && matchesStatus && matchesProvince;
    });
  }, [projects, searchQuery, selectedStatus, currentProvinceId]);

  const handleSearch = (query: string) => setSearchQuery(query);

  const handleNavigateToDetails = (id: number) => {
    router.push(`/projects/${id}`);
};

  const handleSubmit = () => {
    const selectedProvince = (provinces ?? []).find((p: any) => p.province_id === provinceId);
    const ssfNumber = `${year}-${region}-${selectedProvince?.province_name ?? ""}-${number}`;

    if (!year || !provinceId || !statusId || !number || !businessName || !projectTitle) {
      addToast({
        type: "warning",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        duration: 3000,
      });
      return;
    }

    createProject.mutate(
      {
        province_id: provinceId,
        created_by: currentUser?.user_id,
        project_status_id: statusId,
        ssf_number: ssfNumber,
        business_name: businessName,
        project_title: projectTitle,
        proposed_by: proposedBy || undefined,
      },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            title: "Project Created",
            description: "The project was added successfully.",
            duration: 3000,
          });
          setIsAddModalOpen(false);
          setYear("");
          setRegion("XI");
          setProvinceId(undefined);
          setNumber("");
          setBusinessName("");
          setProjectTitle("");
          setProposedBy("");
          setStatusId(undefined);
        },
        onError: (error: any) => {
          addToast({
            type: "error",
            title: "Failed to Create Project",
            description: error?.message || "Something went wrong.",
            duration: 3000,
          });
        },
      }
    );
  };

  return (
    <>
      <div className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] p-6">
        <div className="max-w-[1250px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary-blue">
              Provinces &gt; <span>{provinceName}</span>
            </h1>
          </div>

          <SearchBar onSearch={handleSearch} placeholder="Search projects..." />

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Dropdown
                options={statusOptions}
                placeholder="Status"
                selectedValue={selectedStatus}
                onSelect={(option) => setSelectedStatus(option.value)}
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

          <div className="bg-white rounded-lg shadow-xs overflow-hidden">
            {projectsLoading ? (
              <div className="p-8 text-center text-gray-500">Loading projects...</div>
            ) : (
              <ProjectListTable
                projects={filteredProjects}
                onViewProject={handleNavigateToDetails}
                variant="string"
              />
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title="New Project"
            width="420px"
            height="auto"
            onCancel={() => setIsAddModalOpen(false)}
            onSecondaryAction={() => setIsAddModalOpen(false)}
            secondaryButtonLabel="Cancel"
            buttonLabel={createProject.isPending ? "Adding..." : "Add Project"}
            onSubmit={handleSubmit}
          >
            <div className="text-sm font-semibold text-[#182286]">SSF Number Details</div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Year"
                name="year"
                placeholder="YYYY"
                value={year}
                onChange={setYear}
                maxLength={4}
              />
              <InputField
                label="Region"
                name="region"
                placeholder="XI"
                value={region}
                onChange={setRegion}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                variant="secondary"
                label="Province"
                options={provinceOptions}
                selectedValue={provinceId}
                onSelect={(option) => setProvinceId(Number(option.value))}
                placeholder="Province"
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
              placeholder="Enter name (optional)"
              value={proposedBy}
              onChange={setProposedBy}
            />

            <Dropdown
              variant="secondary"
              label="Status"
              options={statusOptions}
              selectedValue={statusId}
              onSelect={(option) => setStatusId(Number(option.value))}
              placeholder="Status"
            />
          </InputForms>
        </div>
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </>
  );
}