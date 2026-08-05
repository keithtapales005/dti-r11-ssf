"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "../../components/search-bar";
import { DynamicButton } from "../../components/dynamic-buttons";
import UploadField from "../../components/upload-field";
import {
  PlusIcon,
  PencilIcon,
  ChevronLeftIcon,
} from "../../components/icons";
import { ToastContainer, type ToastProps } from "../../components/dynamic-toast";
import { ConfirmationModal } from "../../components/confirmation-modal";
import { ProjectCardDetails } from "@/app/components/project-card-details";
import Footer from "../../components/footer";
import Pagination from "../../components/pagination";
import { useProject } from "@/lib/queries/projectQueries";
import { useConcernsByProject } from "@/lib/queries/concernQueries";
import { useCreateConcern } from "@/lib/mutations/concernMutation";
import Dropdown, { DropdownOption } from "@/app/components/dropdown";
import { useChecklistByProject } from "@/lib/queries/checklistQueries";
import { useFilesByProject } from "@/lib/queries/fileQueries";
import { useUploadFile, useDeleteFile } from "@/lib/mutations/fileMutation";
import { useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from "@/lib/mutations/checklistMutation";

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

type UserRole = "Viewer" | "Admin";

interface FileRecord {
  id: string;
  fileName: string;
  fileLink?: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  fileType: string;
}

interface ProjectDetails {
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
}

// ------------------------------------------------------------------
// MOCK DATA
// ------------------------------------------------------------------

const MOCK_PROJECT_DETAILS: ProjectDetails = {
  ssfNumber: "2024-XI-DVO-0001",
  businessName: "Davao City Chamber of Commerce and Industry, Inc.",
  projectTitle: "SSF-Business Resource Center - Davao City",
  status: "Operational",
  filesCount: 14,
};

const DELETED_PROJECTS_STORAGE_KEY = "ssf-deleted-projects";
const PROJECT_UPDATES_STORAGE_KEY = "ssf-project-updates";

// Mock file data - sorted by most recent first
const INITIAL_FILES: FileRecord[] = [
  {
    id: "file-14",
    fileName: "Project_Report_Final.pdf",
    fileSize: "2.4 MB",
    uploadedBy: "Admin User",
    uploadedDate: "2024-05-18",
    fileType: "pdf",
  },
  {
    id: "file-13",
    fileName: "Budget_Allocation_2024.xlsx",
    fileSize: "1.8 MB",
    uploadedBy: "Finance Team",
    uploadedDate: "2024-05-17",
    fileType: "xlsx",
  },
  {
    id: "file-12",
    fileName: "Compliance_Checklist.docx",
    fileSize: "890 KB",
    uploadedBy: "Compliance Officer",
    uploadedDate: "2024-05-16",
    fileType: "docx",
  },
  {
    id: "file-11",
    fileName: "Meeting_Minutes_May2024.pdf",
    fileSize: "1.2 MB",
    uploadedBy: "Admin User",
    uploadedDate: "2024-05-15",
    fileType: "pdf",
  },
  {
    id: "file-10",
    fileName: "Participant_List_Q2.csv",
    fileSize: "456 KB",
    uploadedBy: "HR Department",
    uploadedDate: "2024-05-14",
    fileType: "csv",
  },
  {
    id: "file-9",
    fileName: "Training_Materials_v2.zip",
    fileSize: "45.6 MB",
    uploadedBy: "Training Coordinator",
    uploadedDate: "2024-05-13",
    fileType: "zip",
  },
  {
    id: "file-8",
    fileName: "Risk_Assessment_Report.pdf",
    fileSize: "3.1 MB",
    uploadedBy: "Risk Manager",
    uploadedDate: "2024-05-12",
    fileType: "pdf",
  },
  {
    id: "file-7",
    fileName: "Database_Backup_May2024.sql",
    fileSize: "12.5 MB",
    uploadedBy: "IT Support",
    uploadedDate: "2024-05-11",
    fileType: "sql",
  },
  {
    id: "file-6",
    fileName: "Marketing_Campaign_Strategy.pptx",
    fileSize: "5.8 MB",
    uploadedBy: "Marketing Team",
    uploadedDate: "2024-05-10",
    fileType: "pptx",
  },
  {
    id: "file-5",
    fileName: "Partnership_Agreement.pdf",
    fileSize: "2.2 MB",
    uploadedBy: "Legal Team",
    uploadedDate: "2024-05-09",
    fileType: "pdf",
  },
  {
    id: "file-4",
    fileName: "Quarterly_Financial_Report.xlsx",
    fileSize: "2.9 MB",
    uploadedBy: "Finance Team",
    uploadedDate: "2024-05-08",
    fileType: "xlsx",
  },
  {
    id: "file-3",
    fileName: "Staff_Handbook_2024.pdf",
    fileSize: "1.5 MB",
    uploadedBy: "HR Department",
    uploadedDate: "2024-05-07",
    fileType: "pdf",
  },
  {
    id: "file-2",
    fileName: "Vendor_Contract_Template.docx",
    fileSize: "780 KB",
    uploadedBy: "Procurement",
    uploadedDate: "2024-05-06",
    fileType: "docx",
  },
  {
    id: "file-1",
    fileName: "Project_Initiation_Document.pdf",
    fileSize: "1.9 MB",
    uploadedBy: "Project Manager",
    uploadedDate: "2024-05-05",
    fileType: "pdf",
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

function getFileTypeFromName(fileName: string) {
  const parts = fileName.trim().split(".");
  if (parts.length < 2) {
    return "unknown";
  }

  const extension = parts.pop();
  return extension ? extension.toLowerCase() : "unknown";
}

function getFileTypeFromFile(file: File, fallbackName?: string) {
  const fromName = getFileTypeFromName(file.name);
  if (fromName !== "unknown") {
    return fromName;
  }

  if (fallbackName) {
    const fromFallbackName = getFileTypeFromName(fallbackName);
    if (fromFallbackName !== "unknown") {
      return fromFallbackName;
    }
  }

  const mimeSubtype = file.type.split("/")[1];
  if (!mimeSubtype) {
    return "unknown";
  }

  return mimeSubtype.toLowerCase().split("+")[0] || "unknown";
}

async function simulateFileUpload(
  fileName: string,
  fileSize: string,
  uploadedBy: string,
  fileLink?: string,
  fileType?: string,
): Promise<FileRecord> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    id: makeId("file"),
    fileName,
    fileLink,
    fileSize,
    uploadedBy,
    uploadedDate: new Date().toISOString().split("T")[0],
    fileType: fileType || getFileTypeFromName(fileName),
  };
}

async function simulateFileDelete(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Simulate delete
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------

export default function FilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = Number(searchParams.get("projectId"));
  const { data: realProject, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: realFiles, isLoading: filesLoading } = useFilesByProject(projectId);
  const uploadFile = useUploadFile(projectId);
  const deleteFileMutation = useDeleteFile(projectId);

  const provinceName = searchParams.get("province") || "Davao City";
  const paramSsfNumber = searchParams.get("ssfNumber");
  const paramBusinessName = searchParams.get("businessName");
  const paramProjectTitle = searchParams.get("projectTitle");
  const paramStatus = searchParams.get("status");
  const paramFilesCount = searchParams.get("filesCount");
  const userRole: UserRole =
    searchParams.get("role") === "Viewer" ? "Viewer" : "Admin"; // TODO: Replace with backend auth/session role

  const files: FileRecord[] = useMemo(() => {
    if (!realFiles) return [];
    return realFiles.map((f) => ({
      id: String(f.file_id),
      fileName: f.file_name,
      fileLink: f.external_link ?? undefined,
      fileSize: f.file_size < 1024 * 1024
        ? `${(f.file_size / 1024).toFixed(1)} KB`
        : `${(f.file_size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedBy: `User #${f.created_by}`,
      uploadedDate: f.created_at.split("T")[0],
      fileType: f.file_type.split("/")[1] || f.file_type,
    }));
  }, [realFiles]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileRecord | null>(null);
  const [isProjectDeleteOpen, setIsProjectDeleteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileLink, setUploadFileLink] = useState("");
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    ssfNumber: paramSsfNumber || MOCK_PROJECT_DETAILS.ssfNumber,
    businessName: paramBusinessName || MOCK_PROJECT_DETAILS.businessName,
    projectTitle: paramProjectTitle || MOCK_PROJECT_DETAILS.projectTitle,
    status: (paramStatus as ProjectDetails["status"]) || MOCK_PROJECT_DETAILS.status,
    filesCount: paramFilesCount
      ? Number.parseInt(paramFilesCount, 10)
      : MOCK_PROJECT_DETAILS.filesCount,
  });

  // Once real project data arrives from the backend, override the mock/param-based details
  // Once real project data arrives from the backend, override the mock/param-based details
  useEffect(() => {
    if (realProject) {
      setProjectDetails((prev) => ({
        ...prev,
        ssfNumber: realProject.ssf_number,
        businessName: realProject.business_name,
        projectTitle: realProject.project_title,
        yearLaunched: realProject.year_launched,
        dateEstablished: realProject.date_established,
        industry: realProject.industry,
        projectCost: realProject.project_cost,
      }));
    }
  }, [realProject]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(PROJECT_UPDATES_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const updates = JSON.parse(stored) as Array<{
        id: string;
        ssfNumber: string;
        businessName: string;
        projectTitle: string;
        status: ProjectDetails["status"];
        filesCount: number;
      }>;

      const currentId = paramSsfNumber || MOCK_PROJECT_DETAILS.ssfNumber;
      const updated = updates.find(
        (entry) => entry.id === currentId || entry.ssfNumber === currentId,
      );

      if (updated) {
        setProjectDetails({
          ssfNumber: updated.ssfNumber,
          businessName: updated.businessName,
          projectTitle: updated.projectTitle,
          status: updated.status,
          filesCount: updated.filesCount,
        });
      }
    } catch {
      // Ignore malformed storage and keep the route-based values.
    }
  }, [paramSsfNumber]);

  const currentUser = useMemo(
    () => ({ username: "Username", initials: "U" }),
    [],
  );


  const ITEMS_PER_PAGE = 10;

  const filteredFiles = useMemo(() => {
    let result = files;

    if (searchQuery.trim()) {
      const query = normalize(searchQuery);
      result = result.filter(
        (f) =>
          normalize(f.fileName).includes(query) ||
          normalize(f.uploadedBy).includes(query) ||
          normalize(f.fileType).includes(query),
      );
    }

    return result;
  }, [files, searchQuery]);

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFiles.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredFiles, currentPage]);

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

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

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

  const { data: concerns, isLoading: concernsLoading } = useConcernsByProject(projectId);
  const createConcern = useCreateConcern();
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [concernCategory, setConcernCategory] = useState<string>("");
  const [concernDescription, setConcernDescription] = useState("");

  const concernCategoryOptions: DropdownOption[] = [
    { id: "Challenge", label: "Challenge", value: "Challenge" },
    { id: "Operational Concern", label: "Operational Concern", value: "Operational Concern" },
    { id: "Grievance", label: "Grievance", value: "Grievance" },
  ];

  const handleSubmitConcern = () => {
    if (!concernCategory || !concernDescription.trim()) {
      addToast({
        type: "warning",
        title: "Missing Fields",
        description: "Please select a category and enter a description.",
        duration: 3000,
      });
      return;
    }

    createConcern.mutate(
      {
        project_id: projectId,
        category: concernCategory as any,
        description: concernDescription.trim(),
      },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            title: "Concern Reported",
            description: "The concern has been logged successfully.",
            duration: 3000,
          });
          setIsConcernModalOpen(false);
          setConcernCategory("");
          setConcernDescription("");
        },
        onError: (error: any) => {
          addToast({
            type: "error",
            title: "Failed to Report Concern",
            description: error?.message || "Something went wrong.",
            duration: 3000,
          });
        },
      },
    );
  };

  const { data: checklistData, isLoading: checklistLoading } = useChecklistByProject(projectId);
  const createChecklistItem = useCreateChecklistItem();
  const updateChecklistItem = useUpdateChecklistItem(projectId);
  const deleteChecklistItem = useDeleteChecklistItem(projectId);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

  const handleAddChecklistItem = () => {
    if (!newDocumentName.trim()) {
      addToast({
        type: "warning",
        title: "Missing Document Name",
        description: "Please enter a document name.",
        duration: 3000,
      });
      return;
    }

    createChecklistItem.mutate(
      { project_id: projectId, document_name: newDocumentName.trim() },
      {
        onSuccess: () => {
          setNewDocumentName("");
          addToast({
            type: "success",
            title: "Document Added",
            description: "The required document has been added to the checklist.",
            duration: 3000,
          });
        },
        onError: (error: any) => {
          addToast({
            type: "error",
            title: "Failed to Add Document",
            description: error?.message || "Something went wrong.",
            duration: 3000,
          });
        },
      },
    );
  };

  const handleChecklistStatusChange = (id: string, status: "Pending" | "Uploaded" | "Verified") => {
    updateChecklistItem.mutate(
      { id, dto: { status } },
      {
        onError: (error: any) => {
          addToast({
            type: "error",
            title: "Failed to Update Status",
            description: error?.message || "Something went wrong.",
            duration: 3000,
          });
        },
      },
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    deleteChecklistItem.mutate(id, {
      onError: (error: any) => {
        addToast({
          type: "error",
          title: "Failed to Delete Item",
          description: error?.message || "Something went wrong.",
          duration: 3000,
        });
      },
    });
  };

  const createObjectUrl = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  }, []);

  const ensureFileLink = useCallback((file: FileRecord) => {
    if (file.fileLink) {
      return file.fileLink;
    }

    const fallbackContent = [
      `File Name: ${file.fileName}`,
      `File Type: ${file.fileType}`,
      `Created By: ${file.uploadedBy}`,
      `Uploaded Date: ${file.uploadedDate}`,
      "",
      "Frontend fallback preview generated because no backend file URL exists yet.",
    ].join("\n");

    const blob = new Blob([fallbackContent], { type: "text/plain;charset=utf-8" });
    const fallbackUrl = URL.createObjectURL(blob);
    blobUrlsRef.current.add(fallbackUrl);
    return fallbackUrl;
  }, []);

  // ------------------------------------------------------------------
  // MODAL HANDLERS
  // ------------------------------------------------------------------

  const handleOpenAddModal = useCallback(() => {
    setEditingFile(null);
    setUploadFiles([]);
    setUploadFileName("");
    setUploadFileLink("");
    setIsModalOpen(true);
  }, []);

  const handleOpenEditFileModal = useCallback((file: FileRecord) => {
    setEditingFile(file);
    setUploadFiles([]);
    setUploadFileName(file.fileName);
    setUploadFileLink("");
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingFile(null);
    setUploadFiles([]);
    setUploadFileName("");
    setUploadFileLink("");
  }, []);

  const handleOpenProjectDelete = useCallback(() => {
    setIsProjectDeleteOpen(true);
  }, []);

  const handleCloseProjectDelete = useCallback(() => {
    setIsProjectDeleteOpen(false);
  }, []);

  // ------------------------------------------------------------------
  // FILE SUBMISSION
  // ------------------------------------------------------------------

  const handleFileFormSave = useCallback(
    async (payload: { fileName: string; fileLink: string; files: File[] }) => {
      if (!payload.fileName || !payload.fileName.trim()) {
        addToast({
          type: "error",
          title: "Validation Error",
          description: "File name is required.",
        });
        return;
      }

      if (!editingFile && payload.files.length === 0) {
        addToast({
          type: "error",
          title: "Validation Error",
          description: "Please select at least one file to upload.",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        if (editingFile) {
          addToast({
            type: "warning",
            title: "Not Supported Yet",
            description: "Editing an uploaded file isn't supported yet — please delete and re-upload instead.",
          });
        } else {
          const selectedFile = payload.files[0];

          await uploadFile.mutateAsync({
            fileName: payload.fileName.trim(),
            file: selectedFile,
          });

          addToast({
            type: "success",
            title: "Success",
            description: "File uploaded successfully.",
          });
        }

        handleCloseModal();
        setCurrentPage(1);
      } catch (error) {
        addToast({
          type: "error",
          title: "Error",
          description:
            error instanceof Error ? error.message : "An error occurred.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, editingFile, handleCloseModal, uploadFile],
  );

  const handleConfirmDeleteProject = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await simulateFileDelete();
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(DELETED_PROJECTS_STORAGE_KEY);
        const deletedProjects = stored ? (JSON.parse(stored) as string[]) : [];

        if (!deletedProjects.includes(projectDetails.ssfNumber)) {
          window.localStorage.setItem(
            DELETED_PROJECTS_STORAGE_KEY,
            JSON.stringify([...deletedProjects, projectDetails.ssfNumber]),
          );
        }
      }
      addToast({
        type: "success",
        title: "Success",
        description: "Project deleted successfully.",
      });
      handleCloseProjectDelete();
      router.push(`/project-page?province=${encodeURIComponent(provinceName)}`);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete project.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [addToast, handleCloseProjectDelete, projectDetails.ssfNumber]);

  const handleOpenFile = useCallback(
    (file: FileRecord) => {
      const fileLink = ensureFileLink(file);

      if (
        fileLink.startsWith("http://") ||
        fileLink.startsWith("https://") ||
        fileLink.startsWith("blob:")
      ) {
        window.open(fileLink, "_blank", "noopener,noreferrer");
        return;
      }

      if (fileLink.startsWith("/")) {
        router.push(fileLink);
        return;
      }

      window.open(fileLink, "_blank", "noopener,noreferrer");
    },
    [ensureFileLink, router],
  );

  const handleDownloadFile = useCallback(
    async (file: FileRecord) => {
      const fileLink = ensureFileLink(file);

      try {
        const anchor = document.createElement("a");

        const ensureHasExtension = (name: string, ext?: string) => {
          const trimmed = name.trim();
          if (!ext || ext === "unknown") return trimmed;
          if (trimmed.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) return trimmed;
          return `${trimmed}.${ext}`;
        };

        const safeFileName = ensureHasExtension(file.fileName, file.fileType);

        if (fileLink.startsWith("blob:")) {
          anchor.href = fileLink;
          anchor.download = safeFileName;
          anchor.rel = "noopener noreferrer";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();

          // Delay revoking the blob URL to avoid the browser saving using the URL
          setTimeout(() => {
            try {
              if (blobUrlsRef.current.has(fileLink)) {
                URL.revokeObjectURL(fileLink);
                blobUrlsRef.current.delete(fileLink);
              }
            } catch (e) {
              // ignore
            }
          }, 2000);

          return;
        }

        const isHttp =
          fileLink.startsWith("http://") ||
          fileLink.startsWith("https://") ||
          fileLink.startsWith("/");

        if (isHttp) {
          const response = await fetch(fileLink);
          if (!response.ok) {
            throw new Error("Unable to fetch file for download.");
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobUrlsRef.current.add(blobUrl);

          anchor.href = blobUrl;
          anchor.download = safeFileName;
          anchor.rel = "noopener noreferrer";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();

          // Delay revoking so the download can start reliably
          setTimeout(() => {
            try {
              URL.revokeObjectURL(blobUrl);
              blobUrlsRef.current.delete(blobUrl);
            } catch (e) {
              // ignore
            }
          }, 2000);
          return;
        }

        anchor.href = fileLink;
        anchor.download = safeFileName;
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } catch (error) {
        if (
          fileLink.startsWith("http://") ||
          fileLink.startsWith("https://")
        ) {
          window.open(fileLink, "_blank", "noopener,noreferrer");
        }

        addToast({
          type: "error",
          title: "Download Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to download file.",
        });
      }
    },
    [addToast, ensureFileLink],
  );

  // ------------------------------------------------------------------
  // SEARCH HANDLER
  // ------------------------------------------------------------------

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleLogout = useCallback(() => {
    router.push("/login-page");
  }, [router]);

  const handleBackToProjects = useCallback(() => {
    router.push(`/project-page?province=${encodeURIComponent(provinceName)}`);
  }, [provinceName, router]);

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------

  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FC]">
        <p className="text-[#6D7380]">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC]">

      {/* ================= STICKY HEADER & PROJECT DETAILS ================= */}
      <div className="bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] pt-10">
        <div className="max-w-7xl mx-auto pt-10 pb-4">
          {/* Province and Project Info */}
          <div className="mb-10 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToProjects}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#182286] text-[#182286] transition-colors hover:bg-blue-700 "
              aria-label="Go back to projects"
            >
              <ChevronLeftIcon size={20} stroke="#FEFEFE" strokeWidth={2.5} />
            </button>
            <h1 className="text-3xl font-bold text-[#182286] uppercase">
              {provinceName}
            </h1>
          </div>

          {/* Project Details Card */}
          <div className="mb-6">
            <ProjectCardDetails
              projectId={projectId}
              ssfNumber={projectDetails.ssfNumber}
              businessName={projectDetails.businessName}
              projectTitle={projectDetails.projectTitle}
              status={projectDetails.status as ProjectDetails["status"]}
              filesCount={projectDetails.filesCount}
              yearLaunched={projectDetails.yearLaunched}
              dateEstablished={projectDetails.dateEstablished}
              industry={projectDetails.industry}
              projectCost={projectDetails.projectCost}
              isAdminView={userRole === "Admin"}
              onDelete={handleOpenProjectDelete}
            />
          </div>

          {/* Concerns / Grievances Card */}
          <div className="mb-6 bg-white rounded-[10px] px-7 py-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#182286]">
                Challenges / Concerns / Grievances
              </h2>
              {userRole === "Admin" && (
                <DynamicButton
                  label="Report Concern"
                  variant="blue"
                  icon={<PlusIcon size={16} stroke="#FEFEFE" strokeWidth={2} />}
                  iconPosition="left"
                  onClick={() => setIsConcernModalOpen(true)}
                  size="small"
                />
              )}
            </div>

            {concernsLoading ? (
              <p className="text-sm text-[#6D7380]">Loading concerns...</p>
            ) : concerns && concerns.length > 0 ? (
              <div className="flex flex-col gap-3">
                {concerns.map((concern) => (
                  <div
                    key={concern.project_concern_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase text-[#2563EB]">
                        {concern.category}
                      </span>
                      <span className="text-xs text-[#6D7380]">
                        {new Date(concern.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-black">{concern.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6D7380]">No concerns reported yet.</p>
            )}
          </div>

          {/* Document Checklist Card */}
          <div className="mb-6 bg-white rounded-[10px] px-7 py-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#182286]">
                Document Completion Checklist
              </h2>
              {checklistData && (
                <span className="text-sm font-semibold text-[#2563EB]">
                  {checklistData.verifiedCount} / {checklistData.total} Verified
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="h-full bg-[#182286] transition-all duration-300"
                style={{ width: `${checklistData?.progressPercentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-[#6D7380] mb-4">
              {checklistData?.progressPercentage ?? 0}% complete
            </p>

            <button
              type="button"
              onClick={() => setIsChecklistExpanded((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] mb-4"
            >
              {isChecklistExpanded ? "Hide" : "View"} Required Documents
              <span className={`transition-transform ${isChecklistExpanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {isChecklistExpanded && (
              <>
                {checklistLoading ? (
                  <p className="text-sm text-[#6D7380]">Loading checklist...</p>
                ) : (
                  <div className="flex flex-col gap-2 mb-4">
                    {checklistData?.items.map((item) => (
                      <div
                        key={item.checklist_id}
                        className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
                      >
                        <span className="text-sm text-black">{item.document_name}</span>
                        <div className="flex items-center gap-2">
                          {userRole === "Admin" ? (
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleChecklistStatusChange(
                                  item.checklist_id,
                                  e.target.value as "Pending" | "Uploaded" | "Verified",
                                )
                              }
                              className="text-xs font-semibold rounded-md border border-gray-200 px-2 py-1 outline-none text-black"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Uploaded">Uploaded</option>
                              <option value="Verified">Verified</option>
                            </select>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-black">
                              {item.status}
                            </span>
                          )}
                          {userRole === "Admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteChecklistItem(item.checklist_id)}
                              className="text-xs text-[#DC2636] hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!checklistData || checklistData.items.length === 0) && (
                      <p className="text-sm text-[#6D7380]">No required documents added yet.</p>
                    )}
                  </div>
                )}

                {userRole === "Admin" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter required document name..."
                      value={newDocumentName}
                      onChange={(e) => setNewDocumentName(e.target.value)}
                      className="flex-1 rounded-md border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm text-[#182286] outline-none focus:border-[#182286]"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      disabled={createChecklistItem.isPending}
                      className="rounded-md bg-[#182286] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                      {createChecklistItem.isPending ? "Adding..." : "Add"}
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search files..."
            isLoading={false}
          />
        </div>
      </div>

      {/* ================= FILE TABLE SECTION ================= */}
      <main className="flex-1 w-full flex flex-col bg-[#F5F8FC]">
        <div className="max-w-7xl mx-auto w-full py-6 flex flex-col flex-1">
          {/* Controls: File count and Add File Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#6D7380]">
                Showing{" "}
                <span className="font-semibold text-[#182286]">
                  {paginatedFiles.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#182286]">
                  {filteredFiles.length}
                </span>{" "}
                files
              </p>
            </div>

            {/* Add File Button - Only for Admin, Hidden for Viewer */}
            {userRole === "Admin" ? (
              <DynamicButton
                label="Add File"
                variant="blue"
                icon={<PlusIcon size={16} stroke="#FEFEFE" strokeWidth={2} />}
                iconPosition="left"
                onClick={handleOpenAddModal}
                size="small"
              />
            ) : null}
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
            {filteredFiles.length > 0 ? (
              <>
                {/* Table Header - Sticky */}
                <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 px-6 py-4 bg-[#182286] border-b border-[#182286] font-semibold text-sm text-white">
                  <div className="col-span-4">File Name</div>
                  <div className="col-span-2">File Size</div>
                  <div className="col-span-3">Created By</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-center pr-2">Actions</div>
                </div>

                {/* Table Body */}
                <div>
                  {paginatedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 items-center transition-colors"
                    >
                      <div className="col-span-4">
                        <button
                          type="button"
                          onClick={() => handleOpenFile(file)}
                          className="text-left"
                          aria-label={`Open ${file.fileName}`}
                        >
                          <p className="text-sm font-medium text-[#182286] truncate transition-colors hover:text-[#2563EB] hover:underline">
                            {file.fileName}
                          </p>
                        </button>
                        <p className="text-xs text-[#6D7380]">
                          {file.fileType.toUpperCase()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-[#182286]">
                          {file.fileSize}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm text-[#182286]">
                          {file.uploadedBy}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-[#6D7380]">
                          {file.uploadedDate}
                        </p>
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-2 pr-2">
                        

                        {userRole === "Admin" && (
                          <button
                            onClick={() => handleOpenEditFileModal(file)}
                            className="p-1 hover:bg-blue-50 rounded transition-colors"
                            aria-label={`Edit ${file.fileName}`}
                            disabled={isSubmitting}
                          >
                            <PencilIcon
                              size={16}
                              stroke="#2563EB"
                              strokeWidth={2}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <p className="text-lg text-[#6D7380] mb-4">No files found.</p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                    >
                      Clear Search
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
                key={`${currentPage}-${totalPages}`}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= MODAL OVERLAY & FORM ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Dimmed Background */}
          <div
            className="absolute inset-0 bg-[#182286]/20 backdrop-blur-[1px]"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-[666px] mx-4 focus:outline-none"
            tabIndex={-1}
          >
            {/* Upload Field Component */}
            <UploadField
              mode={editingFile ? "edit" : "add"}
              title={editingFile ? "Edit File" : "Upload File"}
              label={editingFile ? "Replace File (Optional)" : "Select File"}
              fileName={uploadFileName}
              fileLink={uploadFileLink}
              files={uploadFiles}
              onFileNameChange={setUploadFileName}
              onFileLinkChange={setUploadFileLink}
              onFilesChange={(nextFiles) => {
                setUploadFiles(nextFiles);
                if (!uploadFileName.trim() && nextFiles[0]) {
                  setUploadFileName(nextFiles[0].name);
                }
              }}
              onCancel={handleCloseModal}
              onRequestDeleteProject={handleOpenProjectDelete}
              onSave={handleFileFormSave}
              disabled={isSubmitting}
              accept="*/*"
            />
          </div>
        </div>
      )}

      {/* ================= REPORT CONCERN MODAL ================= */}
      {isConcernModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concern-modal-title"
        >
          <div
            className="absolute inset-0 bg-[#182286]/20 backdrop-blur-[1px]"
            onClick={() => setIsConcernModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[500px] mx-4 p-6 flex flex-col gap-4">
            <h2 id="concern-modal-title" className="text-xl font-bold text-[#182286]">
              Report a Concern
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#182286]">Category</label>
              <Dropdown
                variant="secondary"
                options={concernCategoryOptions}
                selectedValue={concernCategory}
                onSelect={(option) => setConcernCategory(String(option.value))}
                placeholder="Select category"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#182286]">Description</label>
              <textarea
                className="w-full rounded-md border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm text-[#182286] outline-none focus:border-[#182286]"
                rows={4}
                placeholder="Describe the challenge, concern, or grievance..."
                value={concernDescription}
                onChange={(e) => setConcernDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsConcernModalOpen(false)}
                className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-semibold text-[#182286] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitConcern}
                disabled={createConcern.isPending}
                className="flex-1 rounded-md bg-[#182286] py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {createConcern.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProjectDeleteOpen && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Project"
          message="Delete this project and all of its files? This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel="Delete Project"
          onCancel={handleCloseProjectDelete}
          onConfirm={handleConfirmDeleteProject}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      )}

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