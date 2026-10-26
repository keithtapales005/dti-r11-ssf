"use client";

import { usePermissions } from "@/lib/hooks/usePermissions";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/app/components/input-field";
import { ConfirmationModal } from "@/app/components/confirmation-modal";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useProvinces } from "@/lib/queries/provinceQueries";
import { useProjectStatuses } from "@/lib/queries/projectStatusQueries";
import { useDocumentTypes } from "@/lib/queries/documentTypeQueries";
import { useCreateProject } from "@/lib/mutations/projectMutation";
import { fileService } from "@/lib/services/file.service";

const selectClass =
  "text-sm text-gray-800 rounded-md border border-gray-300 px-3 py-2 outline-none bg-white";

export default function ImportProjectPage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { isSuperadmin } = usePermissions();
  const { data: provinces } = useProvinces();
  const { data: statuses } = useProjectStatuses();
  const { data: documentTypes } = useDocumentTypes();
  const createProject = useCreateProject();

  const [ssfNumber, setSsfNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const effectiveProvinceId = isSuperadmin ? provinceId : String(currentUser?.province_id ?? "");
  const [statusId, setStatusId] = useState("");
  const [yearLaunched, setYearLaunched] = useState("");
  const [dateEstablished, setDateEstablished] = useState("");
  const [industry, setIndustry] = useState("");
  const [projectCost, setProjectCost] = useState("");

  const [filesByType, setFilesByType] = useState<Record<number, File[]>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const types = documentTypes ?? [];
  const requiredTypes = types.filter((t) => t.is_required);
  const missingTypes = requiredTypes.filter(
    (t) => (filesByType[t.document_type_id] ?? []).length === 0,
  );
  const totalFiles = Object.values(filesByType).reduce((sum, list) => sum + list.length, 0);

  const addFiles = (typeId: number, list: FileList | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    setFilesByType((prev) => ({ ...prev, [typeId]: [...(prev[typeId] ?? []), ...incoming] }));
  };

  const removeFile = (typeId: number, index: number) => {
    setFilesByType((prev) => ({
      ...prev,
      [typeId]: (prev[typeId] ?? []).filter((_, i) => i !== index),
    }));
  };

  const detailsValid =
    ssfNumber.trim() !== "" &&
    businessName.trim() !== "" &&
    projectTitle.trim() !== "" &&
    effectiveProvinceId !== "" &&
    statusId !== "";

  const doImport = async () => {
    if (!currentUser?.user_id) {
      addToast({ type: "error", title: "Not signed in", description: "Could not determine your user ID.", duration: 4000 });
      return;
    }

    setIsSubmitting(true);
    try {
      setProgress("Creating project...");
      const result = await createProject.mutateAsync({
        province_id: Number(effectiveProvinceId),
        created_by: currentUser.user_id,
        project_status_id: Number(statusId),
        ssf_number: ssfNumber.trim(),
        business_name: businessName.trim(),
        project_title: projectTitle.trim(),
        year_launched: yearLaunched ? Number(yearLaunched) : undefined,
        date_established: dateEstablished || undefined,
        industry: industry.trim() || undefined,
        project_cost: projectCost ? Number(projectCost) : undefined,
      });

      const projectId = result?.data?.project_id;
      if (!projectId) {
        throw new Error("Project was created but no project ID was returned.");
      }

      const failed: string[] = [];
      let done = 0;
      for (const type of types) {
        const files = filesByType[type.document_type_id] ?? [];
        for (const file of files) {
          setProgress(`Uploading file ${done + 1} of ${totalFiles}...`);
          try {
            await fileService.uploadFile(projectId, file.name, file, type.document_type_id);
          } catch {
            failed.push(file.name);
          }
          done++;
        }
      }

      if (failed.length > 0) {
        addToast({
          type: "error",
          title: "Project created, some files failed",
          description: `Failed: ${failed.join(", ")}. Add them from the project's Files tab.`,
          duration: 6000,
        });
      } else {
        addToast({ type: "success", title: "Project imported", description: "", duration: 3000 });
      }
      router.push(`/projects/${projectId}`);
    } catch (error: any) {
      addToast({ type: "error", title: "Import failed", description: error?.message, duration: 5000 });
    } finally {
      setIsSubmitting(false);
      setProgress("");
    }
  };

  const handleImportClick = () => {
    if (!detailsValid) {
      addToast({
        type: "error",
        title: "Missing project details",
        description: "SSF number, business name, project title, province and status are required.",
        duration: 4000,
      });
      return;
    }
    if (missingTypes.length > 0) {
      setIsConfirmOpen(true);
      return;
    }
    doImport();
  };

  return (
    <div
      className="w-full min-h-screen bg-linear-to-b from-[#C8DBFD] to-[#F5F8FC] py-6 pr-6 pl-36"
      style={{ paddingLeft: "140px" }}
    >
      <div className="max-w-[1000px] mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#182286]">Import Finished Project</h1>

        <div className="bg-white rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#182286]">Project Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="SSF Number" name="ssfNumber" placeholder="e.g. 2013-XI-DVN-0001" value={ssfNumber} onChange={setSsfNumber} />
            <InputField label="Business Name" name="businessName" placeholder="Business name" value={businessName} onChange={setBusinessName} />
          </div>

          <InputField label="Project Title" name="projectTitle" placeholder="Project title" value={projectTitle} onChange={setProjectTitle} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Province</label>
              <select value={effectiveProvinceId} onChange={(e) => setProvinceId(e.target.value)} disabled={!isSuperadmin} className={selectClass}>
                <option value="">-- Select --</option>
                {(provinces ?? []).map((p: any) => (
                  <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Project Status</label>
              <select value={statusId} onChange={(e) => setStatusId(e.target.value)} className={selectClass}>
                <option value="">-- Select --</option>
                {(statuses ?? []).map((s: any) => (
                  <option key={s.project_status_id} value={s.project_status_id}>{s.status_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Year Launched" name="yearLaunched" placeholder="e.g. 2018" value={yearLaunched} onChange={setYearLaunched} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Date Established</label>
              <input
                type="date"
                value={dateEstablished}
                onChange={(e) => setDateEstablished(e.target.value)}
                className={selectClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Industry" name="industry" placeholder="Industry" value={industry} onChange={setIndustry} />
            <InputField label="Project Cost" name="projectCost" placeholder="0.00" value={projectCost} onChange={setProjectCost} type="number" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#182286]">Required Documents</h2>
            <span className="text-sm text-gray-700">
              <strong>{requiredTypes.length - missingTypes.length}</strong> of{" "}
              <strong>{requiredTypes.length}</strong> required types attached
            </span>
          </div>

          {missingTypes.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {missingTypes.length} required document type(s) still missing. You can still import, but the
              project will be flagged as incomplete.
            </div>
          ) : (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              All required documents attached.
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {types.map((type) => {
              const files = filesByType[type.document_type_id] ?? [];
              return (
                <div key={type.document_type_id} className="py-3 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{type.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${type.is_required ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {type.is_required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <label className="text-sm font-semibold text-[#182286] cursor-pointer hover:underline">
                      Add file(s)
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          addFiles(type.document_type_id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {files.length > 0 && (
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 rounded px-3 py-1.5">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(type.document_type_id, index)}
                            className="ml-3 text-red-600 hover:underline shrink-0"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleImportClick}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-md bg-[#182286] text-white text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? progress || "Importing..." : "Import Project"}
          </button>
        </div>
      </div>

      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          title="Missing Required Documents"
          message={`${missingTypes.length} required document type(s) are missing: ${missingTypes
            .map((t) => t.name)
            .join(", ")}. The project will be imported and flagged as incomplete.`}
          cancelLabel="Go Back"
          confirmLabel="Import Anyway"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            doImport();
          }}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </div>
  );
}