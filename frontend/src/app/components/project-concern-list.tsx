"use client";

import { useCallback, useState } from "react";
import { PencilIcon, TrashIcon } from "@/app/components/icons";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import InputForms from "@/app/components/input-forms";
import Dropdown, { DropdownOption } from "@/app/components/dropdown";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { useCreateConcern, useEditConcern, useDeleteConcern } from "@/lib/mutations/concernMutation";

type ConcernCategory = "Challenge" | "Operational Concern" | "Grievance";

interface Concern {
  project_concern_id: number;
  category: ConcernCategory;
  description: string;
  reported_by?: number;
  created_at: string;
}

interface ProjectConcernListProps {
  projectId: number;
  concerns: Concern[];
}

const CATEGORY_OPTIONS: DropdownOption[] = [
  { id: "Challenge", label: "Challenge", value: "Challenge" },
  { id: "Operational Concern", label: "Operational Concern", value: "Operational Concern" },
  { id: "Grievance", label: "Grievance", value: "Grievance" },
];

const CATEGORY_STYLES: Record<ConcernCategory, string> = {
  "Challenge": "bg-amber-50 text-amber-700 border-amber-200",
  "Operational Concern": "bg-blue-50 text-blue-700 border-blue-200",
  "Grievance": "bg-red-50 text-red-700 border-red-200",
};

export default function ProjectConcernList({ projectId, concerns }: ProjectConcernListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState<ConcernCategory | undefined>();
  const [description, setDescription] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | number>("all");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const createConcern = useCreateConcern();
  const editConcern = useEditConcern();
  const deleteConcern = useDeleteConcern();

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetForm = () => {
    setCategory(undefined);
    setDescription("");
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (concern: Concern) => {
    setEditingId(concern.project_concern_id);
    setCategory(concern.category);
    setDescription(concern.description);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (!category || !description.trim()) {
      addToast({ type: "warning", title: "Missing Fields", description: "Report type and message are required.", duration: 3000 });
      return;
    }
    setIsFormOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmReport = () => {
    if (!category || !description) return;

    if (editingId) {
      editConcern.mutate(
        { id: editingId, dto: { category, description } },
        {
          onSuccess: () => {
            addToast({ type: "success", title: "Report Updated", description: "", duration: 3000 });
            setIsConfirmOpen(false);
            resetForm();
          },
          onError: (error: any) => addToast({ type: "error", title: "Update Failed", description: error?.message, duration: 3000 }),
        }
      );
    } else {
      createConcern.mutate(
        { project_id: projectId, category, description },
        {
          onSuccess: () => {
            addToast({ type: "success", title: "Report Filed", description: "", duration: 3000 });
            setIsConfirmOpen(false);
            resetForm();
          },
          onError: (error: any) => addToast({ type: "error", title: "Failed to File Report", description: error?.message, duration: 3000 }),
        }
      );
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteConcern.mutate(id, {
      onSuccess: () => addToast({ type: "success", title: "Report Removed", description: "", duration: 3000 }),
      onError: (error: any) => addToast({ type: "error", title: "Delete Failed", description: error?.message, duration: 3000 }),
    });
  };

  const filteredConcerns =
    filterCategory === "all" ? concerns : concerns.filter((c) => c.category === filterCategory);

  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#182286]">Comments / Reports</h2>
          <div className="flex gap-3">
            <Dropdown
              options={[{ id: "all", label: "All Categories", value: "all" }, ...CATEGORY_OPTIONS]}
              placeholder="Filter"
              selectedValue={filterCategory}
              onSelect={(option) => setFilterCategory(option.value)}
            />
            <DynamicButton label="Add Report" variant="blue" onClick={handleOpenAdd} />
          </div>
        </div>

        {filteredConcerns.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No reports recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {filteredConcerns.map((concern) => (
              <div key={concern.project_concern_id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[concern.category]}`}>
                    {concern.category}
                  </span>
                  <p className="text-sm text-gray-800 mt-2">{concern.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(concern.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleOpenEdit(concern)} className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded">
                    <PencilIcon size={16} stroke="#2563EB" strokeWidth={2} />
                  </button>
                  <button onClick={() => handleDelete(concern.project_concern_id)} className="p-1.5 text-[#DC2636] hover:bg-red-50 rounded">
                    <TrashIcon size={16} stroke="#DC2636" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title={editingId ? "Edit Report" : "Add Report"}
            width="380px"
            height="auto"
            onCancel={() => { setIsFormOpen(false); resetForm(); }}
            onSecondaryAction={() => { setIsFormOpen(false); resetForm(); }}
            secondaryButtonLabel="Cancel"
            buttonLabel="Report"
            onSubmit={handleFormSubmit}
          >
            <p className="text-xs text-gray-500 -mt-1 mb-1">
              Kindly provide your comments and details below on any operational challenges and concerns.
            </p>
            <Dropdown
              label="Report Type"
              options={CATEGORY_OPTIONS}
              placeholder="Choose Report Type"
              selectedValue={category}
              onSelect={(option) => setCategory(option.value as ConcernCategory)}
              variant="secondary"
            />
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-[#002075]">Report Message</label>
              <textarea
                className="w-full px-3 py-2 text-xs rounded-[5px] border border-[#E5E7EB] bg-[#F9FAFB] text-[#182286] min-h-[70px] focus:outline-none focus:border-[#182286]"
                placeholder="Describe the challenge, concern, or grievance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </InputForms>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title="Confirm Report"
            width="340px"
            height="auto"
            onCancel={handleCancelConfirm}
            onSecondaryAction={handleCancelConfirm}
            secondaryButtonLabel="Cancel"
            buttonLabel="Report"
            secondaryButtonVariant="red"
            onSubmit={handleConfirmReport}
          >
            <p className="text-sm text-gray-600">Are you sure you want to report this message?</p>
          </InputForms>
        </div>
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </>
  );
}