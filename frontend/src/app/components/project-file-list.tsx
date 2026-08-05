"use client";

import { useCallback, useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@/app/components/icons";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import SearchBar from "@/app/components/search-bar";
import UploadField from "@/app/components/upload-field";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { ProjectFile } from "@/lib/types/file";
import { ChecklistResponse } from "@/lib/types/checklist";
import { useUploadFile, useDeleteFile } from "@/lib/mutations/fileMutation";
import {
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from "@/lib/mutations/checklistMutation";

interface ProjectFileListProps {
  projectId: number;
  files: ProjectFile[];
  checklistData?: ChecklistResponse;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProjectFileList({ projectId, files, checklistData }: ProjectFileListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const uploadFile = useUploadFile(projectId);
  const deleteFile = useDeleteFile(projectId);
  const createChecklistItem = useCreateChecklistItem();
  const updateChecklistItem = useUpdateChecklistItem(projectId);
  const deleteChecklistItem = useDeleteChecklistItem(projectId);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = normalize(searchQuery);
    return files.filter(
      (f) =>
        normalize(f.file_name).includes(query) ||
        normalize(f.file_type).includes(query),
    );
  }, [files, searchQuery]);

  const handleOpenUpload = () => {
    setUploadFiles([]);
    setUploadFileName("");
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setUploadFiles([]);
    setUploadFileName("");
  };

  const handleUploadSave = async (payload: { fileName: string; fileLink: string; files: File[] }) => {
    if (!payload.fileName.trim()) {
      addToast({ type: "error", title: "Validation Error", description: "File name is required.", duration: 3000 });
      return;
    }

    if (payload.files.length === 0) {
      addToast({ type: "error", title: "Validation Error", description: "Please select a file to upload.", duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadFile.mutateAsync({ fileName: payload.fileName.trim(), file: payload.files[0] });
      addToast({ type: "success", title: "Success", description: "File uploaded successfully.", duration: 3000 });
      handleCloseUpload();
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFile = (fileId: number) => {
    deleteFile.mutate(fileId, {
      onSuccess: () => addToast({ type: "success", title: "File Deleted", description: "", duration: 3000 }),
      onError: (error: any) =>
        addToast({ type: "error", title: "Delete Failed", description: error?.message, duration: 3000 }),
    });
  };

  const handleAddChecklistItem = () => {
    if (!newDocumentName.trim()) {
      addToast({ type: "warning", title: "Missing Document Name", description: "Please enter a document name.", duration: 3000 });
      return;
    }

    createChecklistItem.mutate(
      { project_id: projectId, document_name: newDocumentName.trim() },
      {
        onSuccess: () => {
          setNewDocumentName("");
          addToast({ type: "success", title: "Document Added", description: "", duration: 3000 });
        },
        onError: (error: any) =>
          addToast({ type: "error", title: "Failed to Add Document", description: error?.message, duration: 3000 }),
      },
    );
  };

  const handleChecklistStatusChange = (id: string, status: "Pending" | "Uploaded" | "Verified") => {
    updateChecklistItem.mutate(
      { id, dto: { status } },
      {
        onError: (error: any) =>
          addToast({ type: "error", title: "Failed to Update Status", description: error?.message, duration: 3000 }),
      },
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    deleteChecklistItem.mutate(id, {
      onError: (error: any) =>
        addToast({ type: "error", title: "Failed to Delete Item", description: error?.message, duration: 3000 }),
    });
  };

  return (
    <>
      {/* Document Checklist Card */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#182286]">Document Completion Checklist</h2>
          {checklistData && (
            <span className="text-sm font-semibold text-[#2563EB]">
              {checklistData.verifiedCount} / {checklistData.total} Verified
            </span>
          )}
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full bg-[#182286] transition-all duration-300"
            style={{ width: `${checklistData?.progressPercentage ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-[#6D7380] mb-4">{checklistData?.progressPercentage ?? 0}% complete</p>

        <button
          type="button"
          onClick={() => setIsChecklistExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] mb-4"
        >
          {isChecklistExpanded ? "Hide" : "View"} Required Documents
          <span className={`transition-transform ${isChecklistExpanded ? "rotate-180" : ""}`}>▼</span>
        </button>

        {isChecklistExpanded && (
          <>
            <div className="flex flex-col gap-2 mb-4">
              {checklistData?.items.map((item) => (
                <div
                  key={item.checklist_id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
                >
                  <span className="text-sm text-black">{item.document_name}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleChecklistStatusChange(item.checklist_id, e.target.value as "Pending" | "Uploaded" | "Verified")
                      }
                      className="text-xs font-semibold rounded-md border border-gray-200 px-2 py-1 outline-none text-black"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Uploaded">Uploaded</option>
                      <option value="Verified">Verified</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.checklist_id)}
                      className="text-xs text-[#DC2636] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {(!checklistData || checklistData.items.length === 0) && (
                <p className="text-sm text-[#6D7380]">No required documents added yet.</p>
              )}
            </div>

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
          </>
        )}
      </div>

      {/* File List Card */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#182286]">Files</h2>
          <DynamicButton
            label="Add File"
            variant="blue"
            icon={<PlusIcon size={16} stroke="#FEFEFE" strokeWidth={2} />}
            iconPosition="left"
            onClick={handleOpenUpload}
          />
        </div>

        <div className="mb-4">
          <SearchBar onSearch={setSearchQuery} placeholder="Search files..." isLoading={false} />
        </div>

        {filteredFiles.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No files found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 font-medium">File Name</th>
                <th className="py-2 font-medium">File Size</th>
                <th className="py-2 font-medium">Uploaded By</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFiles.map((file) => (
                <tr key={file.file_id}>
                  <td className="py-3 font-medium text-gray-900">
                    {file.file_name}
                    <div className="text-xs text-gray-400">{file.file_type.split("/")[1] || file.file_type}</div>
                  </td>
                  <td className="py-3 text-gray-700">{formatFileSize(file.file_size)}</td>
                  <td className="py-3 text-gray-700">{`User #${file.created_by}`}</td>
                  <td className="py-3 text-gray-500">{file.created_at.split("T")[0]}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteFile(file.file_id)}
                      className="p-1.5 text-[#DC2636] hover:bg-red-50 rounded"
                    >
                      <TrashIcon size={16} stroke="#DC2636" strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#182286]/20 backdrop-blur-[1px]" onClick={handleCloseUpload} aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[666px] mx-4 focus:outline-none" tabIndex={-1}>
            <UploadField
              mode="add"
              title="Upload File"
              label="Select File"
              fileName={uploadFileName}
              files={uploadFiles}
              onFileNameChange={setUploadFileName}
              onFilesChange={(nextFiles) => {
                setUploadFiles(nextFiles);
                if (!uploadFileName.trim() && nextFiles[0]) {
                  setUploadFileName(nextFiles[0].name);
                }
              }}
              onCancel={handleCloseUpload}
              onSave={handleUploadSave}
              disabled={isSubmitting}
              accept="*/*"
            />
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </>
  );
}