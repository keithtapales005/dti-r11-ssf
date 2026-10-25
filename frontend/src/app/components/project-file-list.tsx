"use client";

import { useCallback, useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@/app/components/icons";
import SearchBar from "@/app/components/search-bar";
import UploadField from "@/app/components/upload-field";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { ProjectFile } from "@/lib/types/file";
import { ChecklistItem, ChecklistResponse } from "@/lib/types/checklist";
import { useUploadFile, useDeleteFile, useUpdateFile } from "@/lib/mutations/fileMutation";
import { fileService } from "@/lib/services/file.service";
import InputForms from "@/app/components/input-forms";
import InputField from "@/app/components/input-field";
import { useUpdateChecklistItem } from "@/lib/mutations/checklistMutation";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { isForbiddenError } from "@/lib/utils/errors";

interface ProjectFileListProps {
  projectId: number;
  files: ProjectFile[];
  checklistData?: ChecklistResponse;
}

// Where a new file goes: one of the required documents, or "Other Files" (no document type)
interface UploadTarget {
  documentTypeId?: number;
  label: string;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function formatFileSize(bytes: number) {
  const n = Number(bytes);
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

// The backend sends Nest error bodies as JSON text; show only the message.
function messageOf(error: any): string {
  try {
    const m = JSON.parse(error?.message)?.message;
    return Array.isArray(m) ? m.join(", ") : m ?? error.message;
  } catch {
    return error?.message ?? "Something went wrong";
  }
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  Uploaded: "bg-blue-50 text-blue-700 border-blue-200",
  Verified: "bg-green-50 text-green-700 border-green-200",
};

export default function ProjectFileList({ projectId, files, checklistData }: ProjectFileListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const uploadFile = useUploadFile(projectId);
  const deleteFile = useDeleteFile(projectId);
  const updateFile = useUpdateFile(projectId);
  const updateChecklistItem = useUpdateChecklistItem(projectId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [openingFileId, setOpeningFileId] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { canAdd, canEdit, canDelete } = usePermissions();
  const isUploadOpen = uploadTarget !== null;

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleError = (title: string) => (error: any) => {
    if (isForbiddenError(error)) return;
    addToast({ type: "error", title, description: messageOf(error), duration: 4000 });
  };

  // ---- group the files under their required document
  const items: ChecklistItem[] = checklistData?.items ?? [];
  const filesByType = useMemo(() => {
    const map = new Map<number, ProjectFile[]>();
    for (const f of files) {
      if (f.document_type_id == null) continue;
      map.set(f.document_type_id, [...(map.get(f.document_type_id) ?? []), f]);
    }
    return map;
  }, [files]);

  const otherFiles = useMemo(() => {
    const known = new Set(items.map((i) => i.document_type_id));
    return files.filter((f) => f.document_type_id == null || !known.has(f.document_type_id));
  }, [files, items]);

  // ---- search: matches a document's name or any of its files' names
  const query = normalize(searchQuery);
  const fileMatches = (f: ProjectFile) =>
    normalize(f.file_name).includes(query) || normalize(f.file_type ?? "").includes(query);

  const visibleItems = useMemo(() => {
    return items
      .map((item) => {
        const itemFiles = filesByType.get(item.document_type_id) ?? [];
        if (!query) return { item, shownFiles: itemFiles };
        const nameMatch = normalize(item.document_name).includes(query);
        const matching = itemFiles.filter(fileMatches);
        if (!nameMatch && matching.length === 0) return null;
        return { item, shownFiles: nameMatch ? itemFiles : matching };
      })
      .filter((x): x is { item: ChecklistItem; shownFiles: ProjectFile[] } => x !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filesByType, query]);

  const shownOtherFiles = query ? otherFiles.filter(fileMatches) : otherFiles;

  // ---- upload
  const handleOpenUpload = (target: UploadTarget) => {
    setUploadFiles([]);
    setUploadFileName("");
    setUploadTarget(target);
  };

  const handleCloseUpload = () => {
    setUploadTarget(null);
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
      await uploadFile.mutateAsync({
        fileName: payload.fileName.trim(),
        file: payload.files[0],
        documentTypeId: uploadTarget?.documentTypeId,
      });
      addToast({ type: "success", title: "Success", description: "File uploaded successfully.", duration: 3000 });
      handleCloseUpload();
    } catch (error) {
      if (isForbiddenError(error)) return;
      addToast({
        type: "error",
        title: "Error",
        description: error instanceof Error ? messageOf(error) : "Upload failed.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFile = (file: ProjectFile) => {
    if (!window.confirm(`Remove "${file.file_name}"?`)) return;
    deleteFile.mutate(file.file_id, {
      onSuccess: () => addToast({ type: "success", title: "File Deleted", description: "", duration: 3000 }),
      onError: handleError("Delete Failed"),
    });
  };

  const handleOpenFile = async (file: ProjectFile) => {
    setOpeningFileId(file.file_id);
    try {
      const { url } = await fileService.getSignedUrl(file.file_path);
      setPreviewFile(file);
      setPreviewUrl(url);
    } catch (error) {
      addToast({
        type: "error",
        title: "Unable to Open File",
        description: error instanceof Error ? error.message : "Something went wrong.",
        duration: 3000,
      });
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleOpenEdit = (file: ProjectFile) => {
    setEditingFile(file);
    setEditFileName(file.file_name);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingFile(null);
    setEditFileName("");
  };

  const handleEditSubmit = () => {
    if (!editFileName.trim() || !editingFile) {
      addToast({ type: "warning", title: "Missing Name", description: "File name cannot be empty.", duration: 3000 });
      return;
    }

    updateFile.mutate(
      { fileId: editingFile.file_id, fileName: editFileName.trim() },
      {
        onSuccess: () => {
          addToast({ type: "success", title: "File Renamed", description: "", duration: 3000 });
          handleCloseEdit();
        },
        onError: handleError("Rename Failed"),
      },
    );
  };

  // ---- verify (Superadmin): Uploaded -> Verified, and back
  const handleSetStatus = (item: ChecklistItem, status: "Verified" | "Uploaded") => {
    updateChecklistItem.mutate(
      { id: item.checklist_id, dto: { status } },
      {
        onSuccess: () =>
          addToast({
            type: "success",
            title: status === "Verified" ? "Document Verified" : "Verification Removed",
            description: item.document_name,
            duration: 3000,
          }),
        onError: handleError("Could Not Update Status"),
      },
    );
  };

  const renderFileRow = (file: ProjectFile) => (
    <div key={file.file_id} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] items-center gap-3 py-2 text-sm">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => handleOpenFile(file)}
          disabled={openingFileId === file.file_id}
          className="max-w-full truncate text-left font-medium text-[#2563EB] hover:underline disabled:opacity-50"
        >
          {openingFileId === file.file_id ? "Opening..." : file.file_name}
        </button>
        <div className="text-xs text-gray-400">{(file.file_type ?? "").split("/")[1] || file.file_type}</div>
      </div>
      <div className="text-gray-700">{formatFileSize(file.file_size)}</div>
      <div className="text-gray-700">{`User #${file.created_by}`}</div>
      <div className="text-gray-500">{file.created_at.split("T")[0]}</div>
      <div className="flex justify-end">
        {canEdit && (
          <button onClick={() => handleOpenEdit(file)} className="rounded p-1.5 text-[#2563EB] hover:bg-blue-50" title="Rename">
            <PencilIcon size={16} stroke="#2563EB" strokeWidth={2} />
          </button>
        )}
        {canDelete && (
          <button onClick={() => handleDeleteFile(file)} className="ml-1 rounded p-1.5 text-[#DC2636] hover:bg-red-50" title="Remove">
            <TrashIcon size={16} stroke="#DC2636" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );

  const addFileButton = (target: UploadTarget) =>
    canAdd && (
      <button
        type="button"
        onClick={() => handleOpenUpload(target)}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#182286] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
      >
        <PlusIcon size={14} stroke="#FEFEFE" strokeWidth={2} />
        Add File
      </button>
    );

  const nothingToShow = visibleItems.length === 0 && shownOtherFiles.length === 0;

  return (
    <>
      <div className="rounded-lg bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#182286]">Project Documents</h2>
          {checklistData && (
            <span className="text-sm font-semibold text-[#2563EB]">
              {checklistData.verifiedCount} / {checklistData.total} Verified
            </span>
          )}
        </div>

        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-[#182286] transition-all duration-300"
            style={{ width: `${checklistData?.progressPercentage ?? 0}%` }}
          />
        </div>
        <p className="mb-4 text-xs text-[#6D7380]">{checklistData?.progressPercentage ?? 0}% complete</p>

        <div className="mb-4">
          <SearchBar onSearch={setSearchQuery} placeholder="Search documents or files..." isLoading={false} />
        </div>

        {nothingToShow ? (
          <p className="py-6 text-center text-gray-400">{query ? "No documents or files found." : "No required documents yet."}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleItems.map(({ item, shownFiles }) => (
              <div key={item.checklist_id} className="rounded-lg border border-gray-200 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-black">{item.document_name}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[item.status] ?? "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && item.status === "Uploaded" && (
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item, "Verified")}
                        disabled={updateChecklistItem.isPending}
                        className="rounded-md border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                    {canEdit && item.status === "Verified" && (
                      <button
                        type="button"
                        onClick={() => handleSetStatus(item, "Uploaded")}
                        disabled={updateChecklistItem.isPending}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Remove Verification
                      </button>
                    )}
                    {addFileButton({ documentTypeId: item.document_type_id, label: item.document_name })}
                  </div>
                </div>

                {shownFiles.length > 0 ? (
                  <div className="mt-2 divide-y divide-gray-100 border-t border-gray-100">{shownFiles.map(renderFileRow)}</div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">No file uploaded yet.</p>
                )}
              </div>
            ))}

            {(shownOtherFiles.length > 0 || (!query && canAdd)) && (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-black">Other Files</span>
                  {addFileButton({ label: "Other Files" })}
                </div>
                {shownOtherFiles.length > 0 ? (
                  <div className="mt-2 divide-y divide-gray-100 border-t border-gray-100">{shownOtherFiles.map(renderFileRow)}</div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Files that are not one of the required documents.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#182286]/20 backdrop-blur-[1px]" onClick={handleCloseUpload} aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[666px] mx-4 focus:outline-none" tabIndex={-1}>
            <UploadField
              mode="add"
              title={uploadTarget?.documentTypeId ? `Upload: ${uploadTarget.label}` : "Upload File"}
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

      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title="Rename File"
            width="340px"
            height="auto"
            onCancel={handleCloseEdit}
            onSecondaryAction={handleCloseEdit}
            secondaryButtonLabel="Cancel"
            buttonLabel={updateFile.isPending ? "Saving..." : "Save"}
            buttonDisabled={updateFile.isPending}
            onSubmit={handleEditSubmit}
          >
            <InputField
              label="File Name"
              name="editFileName"
              placeholder="Enter file name"
              value={editFileName}
              onChange={setEditFileName}
            />
          </InputForms>
        </div>
      )}

      {previewFile && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={handleClosePreview} aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] mx-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <h3 className="text-sm font-semibold text-[#182286] truncate pr-4">{previewFile.file_name}</h3>
              <div className="flex items-center gap-2 shrink-0">

                <a
                  href={previewUrl}
                  download={previewFile.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#182286] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#182286] hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
              {previewFile.file_type.startsWith("image/") ? (
                <img src={previewUrl} alt={previewFile.file_name} className="w-full h-full object-contain" />
              ) : previewFile.file_type === "application/pdf" ? (
                <iframe src={previewUrl} title={previewFile.file_name} className="w-full h-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 p-6">
                  This file type can&apos;t be previewed here. Use the Download button above to view it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </>
  );
}