"use client";

import { useCallback, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@/app/components/icons";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import InputForms from "@/app/components/input-forms";
import InputField from "@/app/components/input-field";
import { useCreateSupply, useEditSupply, useDeleteSupply } from "@/lib/mutations/supplyMutation";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";

interface Supply {
  project_supply_id: number;
  item_name: string;
  quantity: number;
  unit?: string;
}

interface ProjectSupplyTableProps {
  projectId: number;
  supplies: Supply[];
}

export default function ProjectSupplyTable({ projectId, supplies }: ProjectSupplyTableProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const createSupply = useCreateSupply();
  const editSupply = useEditSupply();
  const deleteSupply = useDeleteSupply();

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleOpenAdd = () => {
    setItemName("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (supply: Supply) => {
    setEditingId(supply.project_supply_id);
    setItemName(supply.item_name);
    setIsEditOpen(true);
  };

  const handleAddSubmit = () => {
    if (!itemName.trim()) {
      addToast({ type: "warning", title: "Missing Name", description: "Enter an item name.", duration: 3000 });
      return;
    }

    createSupply.mutate(
      { project_id: projectId, item_name: itemName, quantity: 1 },
      {
        onSuccess: () => {
          addToast({ type: "success", title: "Item Added", description: "", duration: 3000 });
          setIsAddOpen(false);
          setItemName("");
        },
        onError: (error: any) => addToast({ type: "error", title: "Add Failed", description: error?.message, duration: 3000 }),
      }
    );
  };

  const handleEditSubmit = () => {
    if (!itemName.trim() || editingId === null) return;

    editSupply.mutate(
      { id: editingId, dto: { item_name: itemName } },
      {
        onSuccess: () => {
          addToast({ type: "success", title: "Item Renamed", description: "", duration: 3000 });
          setIsEditOpen(false);
          setEditingId(null);
          setItemName("");
        },
        onError: (error: any) => addToast({ type: "error", title: "Update Failed", description: error?.message, duration: 3000 }),
      }
    );
  };

  const handleQuantityChange = (supply: Supply, delta: number) => {
    const newQty = supply.quantity + delta;
    if (newQty < 1) return;

    editSupply.mutate(
      { id: supply.project_supply_id, dto: { quantity: newQty } },
      {
        onError: (error: any) => addToast({ type: "error", title: "Update Failed", description: error?.message, duration: 3000 }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteSupply.mutate(id, {
      onSuccess: () => addToast({ type: "success", title: "Item Removed", description: "", duration: 3000 }),
      onError: (error: any) => addToast({ type: "error", title: "Delete Failed", description: error?.message, duration: 3000 }),
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#182286]">Supplies / Equipment</h2>
          <DynamicButton
            label="Add Item"
            variant="blue"
            icon={<PlusIcon size={16} stroke="#FEFEFE" strokeWidth={2} />}
            iconPosition="left"
            onClick={handleOpenAdd}
          />
        </div>

        {supplies.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No supplies recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 font-medium">Item Description</th>
                <th className="py-2 font-medium text-center">Quantity</th>
                <th className="py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supplies.map((supply) => (
                <tr key={supply.project_supply_id}>
                  <td className="py-3 font-medium text-gray-900">{supply.item_name}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(supply, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-[#182286] hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="font-semibold text-[#182286] w-4 text-center">{supply.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(supply, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-[#182286] hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleOpenEdit(supply)} className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded">
                      <PencilIcon size={16} stroke="#2563EB" strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(supply.project_supply_id)} className="p-1.5 text-[#DC2636] hover:bg-red-50 rounded ml-1">
                      <TrashIcon size={16} stroke="#DC2636" strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title="Add Item"
            width="340px"
            height="auto"
            onCancel={() => setIsAddOpen(false)}
            onSecondaryAction={() => setIsAddOpen(false)}
            secondaryButtonLabel="Cancel"
            buttonLabel="Add"
            onSubmit={handleAddSubmit}
          >
            <InputField label="Item Name" name="itemName" placeholder="e.g. Industrial Sewing Machine" value={itemName} onChange={setItemName} />
          </InputForms>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputForms
            title="Edit Item Name"
            width="340px"
            height="auto"
            onCancel={() => setIsEditOpen(false)}
            onSecondaryAction={() => setIsEditOpen(false)}
            secondaryButtonLabel="Cancel"
            buttonLabel="Save"
            onSubmit={handleEditSubmit}
          >
            <InputField label="Item Name" name="itemName" placeholder="e.g. Industrial Sewing Machine" value={itemName} onChange={setItemName} />
          </InputForms>
        </div>
      )}

      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
    </>
  );
}