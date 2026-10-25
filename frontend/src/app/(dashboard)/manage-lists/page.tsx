"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGuard from "@/app/components/role-guard";
import { DynamicButton } from "@/app/components/dynamic-buttons";
import { ToastContainer, type ToastProps } from "@/app/components/dynamic-toast";
import { useLookupLists, useLookupValues } from "@/lib/queries/lookupQueries";
import { useCreateLookup, useDeleteLookup, useUpdateLookup } from "@/lib/mutations/lookupMutation";
import type { LookupValue } from "@/lib/types/lookup";

// The backend sends Nest error bodies as JSON text; show only the message.
const messageOf = (error: any): string => {
  try {
    const m = JSON.parse(error?.message)?.message;
    return Array.isArray(m) ? m.join(", ") : m ?? error.message;
  } catch {
    return error?.message ?? "Something went wrong";
  }
};

function ListEditor({ list, label }: { list: string; label: string }) {
  const { data: values = [], isLoading } = useLookupValues(list, true);
  const createValue = useCreateLookup(list);
  const updateValue = useUpdateLookup(list);
  const deleteValue = useDeleteLookup(list);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);
  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    setNewName("");
    setEditingId(null);
  }, [list]);

  const fail = (title: string) => (error: any) =>
    addToast({ type: "error", title, description: messageOf(error), duration: 4000 });

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    createValue.mutate(name, {
      onSuccess: () => {
        setNewName("");
        addToast({ type: "success", title: "Value Added", description: name, duration: 3000 });
      },
      onError: fail("Could Not Add"),
    });
  };

  const handleRename = (v: LookupValue) => {
    const name = editName.trim();
    if (!name || name === v.name) return setEditingId(null);
    updateValue.mutate(
      { id: v.id, dto: { name } },
      { onSuccess: () => setEditingId(null), onError: fail("Could Not Rename") },
    );
  };

  const handleToggle = (v: LookupValue) =>
    updateValue.mutate({ id: v.id, dto: { is_active: !v.is_active } }, { onError: fail("Could Not Update") });

  const handleDelete = (v: LookupValue) => {
    if (!window.confirm(`Delete "${v.name}"? This cannot be undone.`)) return;
    deleteValue.mutate(v.id, {
      onSuccess: () => addToast({ type: "success", title: "Value Deleted", description: v.name, duration: 3000 }),
      onError: fail("Could Not Delete"),
    });
  };

  return (
    <div>
      <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />

      <div className="mb-4 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          maxLength={150}
          placeholder={`New ${label.toLowerCase()} value`}
          className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none [color-scheme:light]"
        />
        <DynamicButton label="Add" variant="blue" loading={createValue.isPending} disabled={!newName.trim()} onClick={handleAdd} />
      </div>

      <div className="overflow-hidden rounded-lg border border-[#D5DAE8] bg-white">
        <div className="grid grid-cols-[2fr_1fr_1fr_2fr] bg-[#202B90] px-6 py-3 text-sm font-semibold text-white">
          <div>Value</div>
          <div>Type</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#D5DAE8] bg-[#F8FAFF]">
          {isLoading ? (
            <div className="px-6 py-6 text-sm text-gray-500">Loading...</div>
          ) : values.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-500">No values yet.</div>
          ) : (
            values.map((v) => (
              <div key={v.id} className="grid grid-cols-[2fr_1fr_1fr_2fr] items-center px-6 py-3 text-sm text-black">
                <div>
                  {editingId === v.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(v);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      maxLength={150}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none [color-scheme:light]"
                    />
                  ) : (
                    <span className={v.is_active ? "" : "text-gray-400 line-through"}>{v.name}</span>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-600">{v.is_system ? "Built-in" : "Custom"}</div>
                <div className="text-xs font-semibold text-gray-600">{v.is_active ? "Active" : "Inactive"}</div>
                <div className="flex justify-end gap-4 text-xs font-semibold">
                  {v.is_system ? (
                    <span className="text-gray-400">Protected</span>
                  ) : editingId === v.id ? (
                    <>
                      <button type="button" onClick={() => handleRename(v)} className="text-[#202B90] hover:underline">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(v.id);
                          setEditName(v.name);
                        }}
                        className="text-[#202B90] hover:underline"
                      >
                        Rename
                      </button>
                      <button type="button" onClick={() => handleToggle(v)} className="text-[#202B90] hover:underline">
                        {v.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" onClick={() => handleDelete(v)} className="text-[#DC2636] hover:underline">Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Built-in values are used by reports and cannot be renamed, deactivated or deleted. Deactivating a custom value hides it
        from new dropdowns while old records keep showing it. A value that is already in use can only be deactivated.
      </p>
    </div>
  );
}

export default function ManageListsPage() {
  const { data: lists = [] } = useLookupLists();
  const [selected, setSelected] = useState<string>("");
  const active = selected || lists[0]?.key || "";
  const activeLabel = lists.find((l) => l.key === active)?.label ?? "";

  return (
    <RoleGuard allowedRoleIds={[1]}>
      <div className="min-h-screen bg-[#EAF0FF] pt-20 text-[#182286]">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold tracking-wide">Manage Lists</h1>
          <p className="mb-6 text-sm text-gray-700">
            Add your own statuses, categories and other choices. They appear in the dropdowns across the system.
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
            {lists.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setSelected(l.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                  l.key === active ? "border-[#202B90] bg-[#202B90] text-white" : "border-[#D5DAE8] bg-white text-[#202B90]"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {active && <ListEditor key={active} list={active} label={activeLabel} />}
        </main>
      </div>
    </RoleGuard>
  );
}
