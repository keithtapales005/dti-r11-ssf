"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "../../components/search-bar";
import StatusBadge from "../../components/status-badge";
import Dropdown, { type DropdownOption } from "../../components/dropdown";
import Pagination from "../../components/pagination";
import { ToastContainer, type ToastProps } from "../../components/dynamic-toast";
import Footer from "../../components/footer";
import { ChevronLeftIcon } from "../../components/icons";
// Approved projects data is inlined below to keep this page self-contained.

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

type ProjectStatus =
  | "For Bidding"
  | "For Delivery & Launching";

type ProjectStage =
  | "For TOR/ PR Preparation/ Pre-Proc"
  | "PhilGEPS/ Pre-Bid"
  | "Opening of Bids/ Bids Evaluation"
  | "For Post-Qual"
  | "With NOA/ Contract"
  | "Awaiting Delivery (with PO/NTP)"
  | "Equipment Delivered (For Launching)";

// ------------------------------------------------------------------
// APPROVED PROJECT DATA
// ------------------------------------------------------------------
type ApprovedProject = {
  id: string;
  ssfNumber: string;
  businessName: string;
  projectTitle: string;
  status: ProjectStatus;
  stage: ProjectStage;
  lastUpdated: string;
};

const INITIAL_PROJECTS: ApprovedProject[] = [
  {
    id: "proj-3",
    ssfNumber: "2024-XI-DVO-0003",
    businessName: "Business Name",
    projectTitle: "Project Title",
    status: "For Bidding",
    stage: "Opening of Bids/ Bids Evaluation",
    lastUpdated: "2026-05-26",
  },
  {
    id: "proj-10",
    ssfNumber: "2021-XI-DVO-0001",
    businessName: "Business Name",
    projectTitle: "Project Title",
    status: "For Delivery & Launching",
    stage: "Equipment Delivered (For Launching)",
    lastUpdated: "2026-05-26",
  },
];

// ------------------------------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------------------------------

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function getStatusForStage(stage: ProjectStage): ProjectStatus {
  switch (stage) {
    case "For TOR/ PR Preparation/ Pre-Proc":
    case "PhilGEPS/ Pre-Bid":
    case "Opening of Bids/ Bids Evaluation":
    case "For Post-Qual":
      return "For Bidding";
    case "With NOA/ Contract":
    case "Awaiting Delivery (with PO/NTP)":
    case "Equipment Delivered (For Launching)":
      return "For Delivery & Launching";
  }
}

function getStageOptions(): DropdownOption[] {
  return [
    { id: "tor-prep", label: "For TOR/ PR Preparation/ Pre-Proc", value: "For TOR/ PR Preparation/ Pre-Proc" },
    { id: "philgeps", label: "PhilGEPS/ Pre-Bid", value: "PhilGEPS/ Pre-Bid" },
    { id: "opening-bids", label: "Opening of Bids/ Bids Evaluation", value: "Opening of Bids/ Bids Evaluation" },
    { id: "post-qual", label: "For Post-Qual", value: "For Post-Qual" },
    { id: "noa-contract", label: "With NOA/ Contract", value: "With NOA/ Contract" },
    { id: "awaiting-delivery", label: "Awaiting Delivery (with PO/NTP)", value: "Awaiting Delivery (with PO/NTP)" },
    { id: "delivered", label: "Equipment Delivered (For Launching)", value: "Equipment Delivered (For Launching)" },
  ];
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------

export default function ApprovedStatusPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ApprovedProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const ITEMS_PER_PAGE = 10;

  const STATUS_FILTER_OPTIONS: DropdownOption[] = [
    { id: "all", label: "All Status", value: "" },
    { id: "for-bidding", label: "For Bidding", value: "For Bidding" },
    { id: "for-delivery", label: "For Delivery & Launching", value: "For Delivery & Launching" },
  ];

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (searchQuery.trim()) {
      const query = normalize(searchQuery);
      result = result.filter(
        (p) =>
          normalize(p.ssfNumber).includes(query) ||
          normalize(p.businessName).includes(query) ||
          normalize(p.projectTitle).includes(query) ||
          normalize(p.stage).includes(query) ||
          normalize(p.status).includes(query),
      );
    }

    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [projects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // ------------------------------------------------------------------

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = makeId("toast");
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleLogout = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleBackToProjectPage = useCallback(() => {
    router.push("/project-page");
  }, [router]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStageChange = useCallback((projectId: string, stage: ProjectStage) => {
    const status = getStatusForStage(stage);

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              stage,
              status,
            }
          : project,
      ),
    );

    addToast({
      type: "success",
      title: "Status updated",
      description: `${stage} has been assigned under ${status}.`,
    });
  }, [addToast]);

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC] ">


      {/* ================= HEADER SECTION ================= */}
      <div className="bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] pt-20">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
          {/* Page Title */}
          <div className="mb-8 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToProjectPage}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#182286] text-[#182286] transition-colors hover:bg-blue-700"
              aria-label="Go back to project page"
            >
              <ChevronLeftIcon size={20} stroke="#FEFEFE" strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#182286] uppercase">Project Status</h1>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by SSF Number, Business Name, or Project Title..."
            isLoading={false}
          />
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full overflow-auto bg-[#F5F8FC] mb-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col flex-1">
          {/* Controls: Filter and Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Dropdown
                options={STATUS_FILTER_OPTIONS}
                selectedValue={statusFilter}
                onSelect={(option) => {
                  setStatusFilter(String(option.value));
                  setCurrentPage(1);
                }}
                placeholder="All Status"
              />
            </div>

            <div>
              <p className="text-sm text-[#6D7380]">
                Showing{" "}
                <span className="font-semibold text-[#182286]">
                  {paginatedProjects.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#182286]">
                  {filteredProjects.length}
                </span>{" "}
                projects
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
            {filteredProjects.length > 0 ? (
              <>
                {/* Table Header - Sticky */}
                <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 px-6 py-4 bg-[#182286] border-b border-[#182286] font-semibold text-xs text-white">
                  <div className="col-span-2">SSF No.</div>
                  <div className="col-span-4">Business Name / Project Title</div>
                  <div className="col-span-1">Last Updated</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Status Description</div>
                </div>

                {/* Table Body */}
                <div>
                  {paginatedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 items-center transition-colors"
                    >
                      <div className="col-span-2">
                        <button
                          type="button"
                          className="text-left"
                          aria-label={`View project ${project.ssfNumber}`}
                        >
                          <p className="text-sm font-medium text-[#2563EB] hover:underline transition-colors">
                            {project.ssfNumber}
                          </p>
                        </button>
                      </div>

                      <div className="col-span-4">
                        <p className="text-sm font-medium text-[#182286] truncate">
                          {project.businessName}
                        </p>
                        <p className="text-xs text-[#6D7380] truncate">
                          {project.projectTitle}
                        </p>
                      </div>

                      <div className="col-span-1">
                        <p className="text-sm text-[#182286]">
                          {project.lastUpdated}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <StatusBadge status={project.status} variant="small" />
                      </div>

                      <div className="col-span-3">
                        <Dropdown
                          options={getStageOptions()}
                          selectedValue={project.stage}
                          onSelect={(option) =>
                            handleStageChange(project.id, option.value as ProjectStage)
                          }
                          placeholder="Select description"
                          variant="secondary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <p className="text-lg text-[#6D7380] mb-4">No projects found.</p>
                  {(searchQuery || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                        setCurrentPage(1);
                      }}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPageNumbers
              />
            </div>
          )}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= TOAST NOTIFICATIONS ================= */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </div>
  );
}
