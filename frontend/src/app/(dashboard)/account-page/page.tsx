"use client";
import { useCallback, useMemo, useState } from "react";
import SearchBar from "../../components/search-bar";
import ProfileBadge from "../../components/profile-badge";
import Pagination from "../../components/pagination";
import DynamicButton from "../../components/dynamic-buttons";
import Dropdown, { DropdownOption } from "../../components/dropdown";
import InputField from "../../components/input-field";
import InputForms from "../../components/input-forms";
import ConfirmationModal from "../../components/confirmation-modal";
import { PlusIcon, XIcon } from "../../components/icons";
import { ToastContainer, type ToastProps } from "../../components/dynamic-toast";
import {
  useUsers,
  useCreateUser,
  useEditUser,
  useDeleteUser,
  useApproveUser,
  useRejectUser,
} from "../../../lib/hooks/useUser";

const ROLE_MAP = {
  Admin: 2,
  Viewer: 3,
} as const;

const DEPARTMENT_MAP = {
  "Regional Office": 1,
  "Assistant Regional Office": 2,
  "Shared Service Facilities Focals": 3,
  "Davao City Field Office": 4,
  "Davao del Sur Provincial Office": 5,
  "Davao del Norte Provincial Office": 6,
  "Davao Oriental Provincial Office": 7,
  "Davao Occidental Provincial Office": 8,
  "Davao de Oro Provincial Office": 9,
} as const;

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type Permission = "Viewer" | "Admin";
type AccessStatus = "Active" | "Blocked" | "Deleted" | "Pending Verification" | "Unknown";

type SaveConfirmation = {
  title: string;
  message: string;
};

type DeleteConfirmation = {
  title: string;
  message: string;
};

type AccountRecord = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  department: string;
  permission: Permission;
  isOnline: boolean;
  access: AccessStatus;
};

const DEPARTMENT_OPTIONS = [
  "Regional Office",
  "Assistant Regional Office",
  "Shared Service Facilities Focals",
  "Davao City Field Office",
  "Davao del Sur Provincial Office",
  "Davao del Norte Provincial Office",
  "Davao Oriental Provincial Office",
  "Davao Occidental Provincial Office",
  "Davao de Oro Provincial Office",
];

const PERMISSION_OPTIONS: Permission[] = ["Viewer", "Admin"];

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function splitName(firstName?: string, lastName?: string) {
  return `${(firstName ?? "").trim()} ${(lastName ?? "").trim()}`.trim();
}

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------
function validateAccountForm(
  form: Record<string, string>,
  existingAccounts: AccountRecord[],
  editingId?: string,
) {
  const errors: Record<string, string> = {};

  if ((form.firstName || "").trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  }
  if ((form.lastName || "").trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  }
  if (!/^[a-zA-Z0-9._-]{3,}$/.test((form.username || "").trim())) {
    errors.username =
      "Username must be at least 3 characters and contain only letters, numbers, dots, underscores, or hyphens.";
  }
  if (!form.department || form.department.trim().length < 2) {
    errors.department = "Please select a department.";
  }
  if (!form.permission) {
    errors.permission = "Please select a permission level.";
  }

  const duplicate = existingAccounts.some(
    (acc) =>
      normalize(acc.username) === normalize(form.username || "") &&
      acc.id !== editingId,
  );
  if (duplicate) {
    errors.username = "That username is already in use.";
  }

  return errors;
}

// ------------------------------------------------------------------
// Filter options for dropdowns
// ------------------------------------------------------------------
const PERMISSION_FILTER_OPTIONS: DropdownOption[] = [
  { id: "all", label: "All Permissions", value: "" },
  { id: "viewer", label: "Viewer", value: "Viewer" },
  { id: "admin", label: "Admin", value: "Admin" },
];

const ACCESS_FILTER_OPTIONS: DropdownOption[] = [
  { id: "all", label: "All Access", value: "" },
  { id: "active", label: "Active", value: "Active" },
  { id: "blocked", label: "Blocked", value: "Blocked" },
  { id: "pending", label: "Pending Verification", value: "Pending Verification" },
  { id: "deleted", label: "Deleted", value: "Deleted" },
];

const DEPARTMENT_FILTER_OPTIONS: DropdownOption[] = [
  { id: "all", label: "All Departments", value: "" },
  ...DEPARTMENT_OPTIONS.map((dept) => ({ id: dept, label: dept, value: dept })),
];

// ------------------------------------------------------------------
// Pencil Icon (if not in icons.tsx)
// ------------------------------------------------------------------
const PencilIcon = ({ size = 16, stroke = "#2563EB" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9M16.5 3.5l4 4L7 21l-4 1 1-4z" />
  </svg>
);

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

export default function AccountPage() {
  // Data fetching (React Query)
  const { data: rawUsers = [], isLoading: usersLoading } = useUsers();

  const createUserMutation = useCreateUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();

  const roleMap: Record<number, Permission> = { 2: "Admin", 3: "Viewer" };

  const accounts: AccountRecord[] = useMemo(() => {
    return rawUsers
      .map((u: any): AccountRecord => ({
        id: String(u.user_id),
        firstName: u.first_name ?? "",
        lastName: u.last_name ?? "",
        username: u.username ?? "",
        department: u.department?.department_name ?? "Unassigned",
        permission: roleMap[u.role_id] ?? "Viewer",
        isOnline: false,
        access: (u.user_status?.user_status_name as AccessStatus) ?? "Unknown",
      }))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [rawUsers]);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationKey, setPaginationKey] = useState(0);

  // Filter states
  const [permissionFilter, setPermissionFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [accessFilter, setAccessFilter] = useState<string>("");

  // Create/Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState<SaveConfirmation>({
    title: "",
    message: "",
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      title: "",
      message: "",
    });

  // Approve modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingAccount, setApprovingAccount] = useState<AccountRecord | null>(null);
  const [approveFormData, setApproveFormData] = useState({ department: "", permission: "" });
  const [approveFormErrors, setApproveFormErrors] = useState<Record<string, string>>({});

  // Reject confirmation state
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [rejectingAccount, setRejectingAccount] = useState<AccountRecord | null>(null);

  // Modal form states (create/edit)
  const [modalFormData, setModalFormData] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    department: "",
    permission: "",
    access: "Active",
  });
  const [modalFormErrors, setModalFormErrors] = useState<
    Record<string, string>
  >({});

  // Toast
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = makeId("toast");
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPaginationKey((k) => k + 1);
  }, []);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    let result = accounts;
    const query = normalize(searchQuery);
    if (query) {
      result = result.filter((acc) => {
        const fullName = splitName(acc.firstName, acc.lastName);
        return (
          fullName.toLowerCase().includes(query) ||
          acc.username.toLowerCase().includes(query) ||
          acc.department.toLowerCase().includes(query) ||
          acc.permission.toLowerCase().includes(query)
        );
      });
    }
    if (permissionFilter) {
      result = result.filter((acc) => acc.permission === permissionFilter);
    }
    if (departmentFilter) {
      result = result.filter((acc) => acc.department === departmentFilter);
    }
    if (accessFilter) {
      result = result.filter((acc) => acc.access === accessFilter);
    } else {
      // Hide deleted accounts by default; only show when explicitly filtered
      result = result.filter((acc) => acc.access !== "Deleted");
    }
    return result;
  }, [accounts, searchQuery, permissionFilter, departmentFilter, accessFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / 7));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPageSafe - 1) * 7;
    return filteredAccounts.slice(start, start + 7);
  }, [currentPageSafe, filteredAccounts]);

  // Handlers
  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      resetPagination();
    },
    [resetPagination],
  );

  const clearFilters = useCallback(() => {
    setPermissionFilter("");
    setDepartmentFilter("");
    setAccessFilter("");
    setSearchQuery("");
    resetPagination();
  }, [resetPagination]);

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setModalFormData({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
      department: "",
      permission: "",
      access: "Active",
    });
    setModalFormErrors({});
    setModalKey((k) => k + 1);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((account: AccountRecord) => {
    setEditingId(account.id);
    setModalFormData({
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      password: "",
      confirmPassword: "",
      department: account.department,
      permission: account.permission,
      access: account.access === "Active" ? "Active" : "Blocked",
    });
    setModalFormErrors({});
    setModalKey((k) => k + 1);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setModalLoading(false);
    setModalFormData({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
      department: "",
      permission: "",
      access: "Active",
    });
    setModalFormErrors({});
    setIsSaveConfirmOpen(false);
    setSaveConfirmation({ title: "", message: "" });
    setIsDeleteConfirmOpen(false);
    setDeleteConfirmation({ title: "", message: "" });
  }, []);

  const closeSaveConfirmation = useCallback(() => {
    setIsSaveConfirmOpen(false);
    setSaveConfirmation({ title: "", message: "" });
  }, []);

  const openSaveConfirmation = useCallback(() => {
    setSaveConfirmation({
      title: editingId ? "Save Changes" : "Create Account",
      message: editingId
        ? "Are you sure you want to save these changes to this account?"
        : "Are you sure you want to add this account?",
    });
    setIsSaveConfirmOpen(true);
  }, [editingId]);

  const openDeleteConfirmation = useCallback(() => {
    if (!editingId) {
      return;
    }

    setDeleteConfirmation({
      title: "Delete Account",
      message: `Delete ${modalFormData.username || "this account"}? This action cannot be undone.`,
    });
    setIsDeleteConfirmOpen(true);
  }, [editingId, modalFormData.username]);

  const closeDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeleteConfirmation({ title: "", message: "" });
  }, []);

  // Approve / Reject open-close handlers
  const openApproveModal = useCallback((account: AccountRecord) => {
    setApprovingAccount(account);
    setApproveFormData({ department: "", permission: "" });
    setApproveFormErrors({});
    setIsApproveModalOpen(true);
  }, []);

  const closeApproveModal = useCallback(() => {
    setIsApproveModalOpen(false);
    setApprovingAccount(null);
    setApproveFormData({ department: "", permission: "" });
    setApproveFormErrors({});
  }, []);

  const openRejectConfirmation = useCallback((account: AccountRecord) => {
    setRejectingAccount(account);
    setIsRejectConfirmOpen(true);
  }, []);

  const closeRejectConfirmation = useCallback(() => {
    setIsRejectConfirmOpen(false);
    setRejectingAccount(null);
  }, []);

  const handleModalFormChange = useCallback(
    (field: string, value: string) => {
      let newValue = value;
      if (field === "username") {
        newValue = value.replace(/^\s+/, "").toLowerCase();
      } else if (["firstName", "lastName"].includes(field)) {
        newValue = value.replace(/^\s+/, "");
        if (newValue.length > 0) {
          newValue = newValue[0].toUpperCase() + newValue.slice(1);
        }
      }

      setModalFormData((prev) => ({ ...prev, [field]: newValue }));
      if (modalFormErrors[field]) {
        setModalFormErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [modalFormErrors],
  );

  const validateModalForm = () => {
    const errors = validateAccountForm(
      modalFormData,
      accounts,
      editingId || undefined,
    );

    if (!modalFormData.username?.trim()) {
      errors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9._-]{3,}$/.test(modalFormData.username.trim())) {
      errors.username =
        "Username must be at least 3 characters and contain only letters, numbers, dots, underscores, or hyphens.";
    }

    if (!editingId && !modalFormData.password) {
      errors.password = "Password is required.";
    } else if (modalFormData.password && modalFormData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!editingId && !modalFormData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (
      !editingId &&
      modalFormData.password !== modalFormData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match.";
    } else if (
      editingId &&
      modalFormData.confirmPassword &&
      modalFormData.password !== modalFormData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!modalFormData.department) {
      errors.department = "Department is required.";
    }

    if (!modalFormData.permission) {
      errors.permission = "Permission is required.";
    }

    const duplicate = accounts.some(
      (acc) =>
        acc.username.toLowerCase() === modalFormData.username.toLowerCase() &&
        acc.id !== editingId,
    );
    if (duplicate) {
      errors.username = "That username is already in use.";
    }

    return errors;
  };

  const handleModalFormSubmit = useCallback(() => {
    const errors = validateModalForm();
    if (Object.keys(errors).length > 0) {
      setModalFormErrors(errors);
      addToast({
        type: "warning",
        title: "Validation warning",
        description: "Please correct the highlighted fields before saving.",
      });
      return;
    }
    openSaveConfirmation();
  }, [addToast, openSaveConfirmation, modalFormData, editingId]);

  const handleConfirmSave = useCallback(async () => {
    setModalLoading(true);
    try {
      if (editingId) {
        await editUserMutation.mutateAsync({
          id: Number(editingId),
          dto: {
            username: modalFormData.username,
            first_name: modalFormData.firstName,
            last_name: modalFormData.lastName,
            role_id: ROLE_MAP[modalFormData.permission as keyof typeof ROLE_MAP],
            department_id:
              DEPARTMENT_MAP[
              modalFormData.department as keyof typeof DEPARTMENT_MAP
              ],
            user_status_id: modalFormData.access === "Active" ? 1 : 2,
          },
        });

        addToast({
          type: "success",
          title: "Account updated",
          description: `${modalFormData.username} was updated.`,
        });
      } else {
        await createUserMutation.mutateAsync({
          username: modalFormData.username,
          first_name: modalFormData.firstName,
          last_name: modalFormData.lastName,
          password: modalFormData.password,
          role_id: ROLE_MAP[modalFormData.permission as keyof typeof ROLE_MAP],
          department_id:
            DEPARTMENT_MAP[
            modalFormData.department as keyof typeof DEPARTMENT_MAP
            ],
          user_status_id: modalFormData.access === "Active" ? 1 : 2,
        } as any);

        addToast({
          type: "success",
          title: "Account created",
          description: `${modalFormData.username} was created.`,
        });
      }
      closeSaveConfirmation();
      closeModal();
      resetPagination();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      closeSaveConfirmation();
      addToast({
        type: "error",
        title: editingId ? "Update failed" : "Create failed",
        description: errorMessage,
      });
    } finally {
      setModalLoading(false);
    }
  }, [
    editingId,
    modalFormData,
    createUserMutation,
    editUserMutation,
    addToast,
    closeSaveConfirmation,
    closeModal,
    resetPagination,
  ]);

  const handleDeleteAccount = useCallback(async () => {
    if (!editingId) {
      return;
    }

    setModalLoading(true);
    try {
      await deleteUserMutation.mutateAsync(Number(editingId));

      addToast({
        type: "success",
        title: "Account deleted",
        description: `${modalFormData.username} was deleted.`,
      });
      closeDeleteConfirmation();
      closeModal();
      resetPagination();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      addToast({
        type: "error",
        title: "Delete failed",
        description: errorMessage,
      });
    } finally {
      setModalLoading(false);
    }
  }, [
    editingId,
    modalFormData.username,
    deleteUserMutation,
    addToast,
    closeDeleteConfirmation,
    closeModal,
    resetPagination,
  ]);

  // Approve / Reject submit handlers
  const handleApproveFormChange = useCallback(
    (field: string, value: string) => {
      setApproveFormData((prev) => ({ ...prev, [field]: value }));
      if (approveFormErrors[field]) {
        setApproveFormErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [approveFormErrors],
  );

  const handleApproveSubmit = useCallback(async () => {
    if (!approvingAccount) return;

    const errors: Record<string, string> = {};
    if (!approveFormData.department) errors.department = "Please select a department.";
    if (!approveFormData.permission) errors.permission = "Please select a permission level.";
    if (Object.keys(errors).length > 0) {
      setApproveFormErrors(errors);
      return;
    }

    try {
      await approveUserMutation.mutateAsync({
        id: Number(approvingAccount.id),
        dto: {
          role_id: ROLE_MAP[approveFormData.permission as keyof typeof ROLE_MAP],
          department_id:
            DEPARTMENT_MAP[approveFormData.department as keyof typeof DEPARTMENT_MAP],
        },
      });

      addToast({
        type: "success",
        title: "Account approved",
        description: `${approvingAccount.username} is now active.`,
      });
      closeApproveModal();
      resetPagination();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      addToast({ type: "error", title: "Approval failed", description: errorMessage });
    }
  }, [approvingAccount, approveFormData, approveUserMutation, addToast, closeApproveModal, resetPagination]);

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectingAccount) return;

    try {
      await rejectUserMutation.mutateAsync(Number(rejectingAccount.id));
      addToast({
        type: "success",
        title: "Account rejected",
        description: `${rejectingAccount.username} was rejected.`,
      });
      closeRejectConfirmation();
      resetPagination();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      addToast({ type: "error", title: "Rejection failed", description: errorMessage });
    }
  }, [rejectingAccount, rejectUserMutation, addToast, closeRejectConfirmation, resetPagination]);

  return (
    <div className="min-h-screen bg-[#EAF0FF] text-[#182286] pt-20">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-[#182286]">
            Account Management
          </h1>
        </div>

        {/* Search bar */}
        <div className="mb-5">
          <SearchBar onSearch={handleSearch} placeholder="Search" />
        </div>

        {/* Filter row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <DynamicButton
              label="All Accounts"
              variant="white"
              size="small"
              onClick={clearFilters}
            />
            <Dropdown
              options={PERMISSION_FILTER_OPTIONS}
              placeholder="Permission ▼"
              selectedValue={permissionFilter}
              onSelect={(opt) => setPermissionFilter(String(opt.value))}
              variant="primary"
            />
            <Dropdown
              options={DEPARTMENT_FILTER_OPTIONS}
              placeholder="Department ▼"
              selectedValue={departmentFilter}
              onSelect={(opt) => setDepartmentFilter(String(opt.value))}
              variant="primary"
            />
            <Dropdown
              options={ACCESS_FILTER_OPTIONS}
              placeholder="Access ▼"
              selectedValue={accessFilter}
              onSelect={(opt) => setAccessFilter(String(opt.value))}
              variant="primary"
            />
          </div>
          <DynamicButton
            label="Add Account"
            variant="blue"
            size="small"
            iconPosition="left"
            icon={<PlusIcon size={16} stroke="#FFFFFF" />}
            onClick={openCreateModal}
            className="shadow-[0_4px_10px_rgba(24,34,134,0.18)]"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-[#D5DAE8] bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-200">
              <div className="grid grid-cols-[2.2fr_1.6fr_1fr_1fr_0.9fr] bg-[#202B90] px-8 py-4 text-sm font-semibold text-white">
                <div>Name / Username</div>
                <div>Department</div>
                <div>Permission</div>
                <div>Access</div>
                <div className="text-center">Action</div>
              </div>
              <div className="divide-y divide-[#D5DAE8] bg-[#F8FAFF]">
                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                    <p className="text-sm text-[#667085]">Loading accounts…</p>
                  </div>
                ) : paginatedAccounts.length > 0 ? (
                  paginatedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="grid grid-cols-[2.2fr_1.6fr_1fr_1fr_0.9fr] items-center px-6 py-4 text-sm sm:px-8"
                    >
                      <div className="flex items-center gap-3">
                        <ProfileBadge
                          firstName={account.firstName}
                          lastName={account.lastName}
                          userId={account.id}
                          isOnline={account.isOnline}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[#3A3A3A]">
                            {splitName(account.firstName, account.lastName)}
                          </div>
                          <div className="truncate text-xs text-[#667085]">
                            {account.username}
                          </div>
                        </div>
                      </div>
                      <div className="truncate text-[#3A3A3A]">
                        {account.department}
                      </div>
                      <div className="inline-flex w-fit items-center rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#182286]">
                        {account.permission}
                      </div>
                      <div
                        className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold"
                        style={
                          account.access === "Active"
                            ? { backgroundColor: "#DCFCE7", color: "#166534" }
                            : account.access === "Pending Verification"
                              ? { backgroundColor: "#FEF3C7", color: "#92400E" }
                              : account.access === "Deleted"
                                ? { backgroundColor: "#F3F4F6", color: "#374151" }
                                : { backgroundColor: "#FEE2E2", color: "#991B1B" }
                        }
                      >
                        {account.access}
                      </div>
                      <div className="flex justify-center gap-3">
                        {account.access === "Pending Verification" ? (
                          <>
                            <DynamicButton
                              label="Approve"
                              variant="clear"
                              size="small"
                              className="px-0 py-0 text-[#16A34A]"
                              onClick={() => openApproveModal(account)}
                            />
                            <DynamicButton
                              label="Reject"
                              variant="clear"
                              size="small"
                              className="px-0 py-0 text-[#DC2626]"
                              onClick={() => openRejectConfirmation(account)}
                            />
                          </>
                        ) : (
                          <DynamicButton
                            label="Edit"
                            variant="clear"
                            size="small"
                            iconPosition="right"
                            icon={<PencilIcon size={16} stroke="#2563EB" />}
                            className="px-0 py-0 text-[#2563EB]"
                            onClick={() => openEditModal(account)}
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                    <div className="rounded-full bg-[#E8EDF8] p-4 text-[#182286]">
                      <XIcon size={24} />
                    </div>
                    <div className="max-w-sm">
                      <h3 className="text-lg font-semibold text-[#182286]">
                        No accounts found
                      </h3>
                      <p className="mt-1 text-sm text-[#667085]">
                        Try adjusting your filters or create a new account.
                      </p>
                    </div>
                    <DynamicButton
                      label="Add Account"
                      variant="blue"
                      size="small"
                      iconPosition="left"
                      icon={<PlusIcon size={16} stroke="#FFFFFF" />}
                      onClick={openCreateModal}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <Pagination
            key={paginationKey}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <InputForms
            key={modalKey}
            title={editingId ? "Edit Account" : "Create an Account"}
            onCancel={closeModal}
            onSubmit={handleModalFormSubmit}
            onSecondaryAction={editingId ? openDeleteConfirmation : closeModal}
            showCloseButton={true}
            width="560px"
            mode={editingId ? "edit" : "add"}
            buttonLabel={editingId ? "Save Changes" : "Create Account"}
            secondaryButtonLabel={editingId ? "Delete Account" : "Cancel"}
            secondaryButtonVariant={editingId ? "red" : "white"}
            buttonLoading={modalLoading}
            buttonDisabled={modalLoading}
            secondaryButtonDisabled={modalLoading}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="First Name"
                name="firstName"
                placeholder="Enter first name"
                value={modalFormData.firstName}
                onChange={(value) => handleModalFormChange("firstName", value)}
                required
                error={modalFormErrors.firstName}
                disabled={modalLoading}
              />

              <InputField
                label="Last Name"
                name="lastName"
                placeholder="Enter last name"
                value={modalFormData.lastName}
                onChange={(value) => handleModalFormChange("lastName", value)}
                required
                error={modalFormErrors.lastName}
                disabled={modalLoading}
              />
            </div>
            {/* Username */}
            <InputField
              label="Username"
              name="username"
              placeholder="Enter username"
              value={modalFormData.username}
              onChange={(value) => handleModalFormChange("username", value)}
              required
              error={modalFormErrors.username}
              disabled={modalLoading}
            />

            {/* Password */}
            <InputField
              label="New Password"
              name="password"
              placeholder="Enter password"
              type="password"
              value={modalFormData.password}
              onChange={(value) => handleModalFormChange("password", value)}
              required={!editingId}
              error={modalFormErrors.password}
              disabled={modalLoading}
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Enter password"
              type="password"
              value={modalFormData.confirmPassword}
              onChange={(value) =>
                handleModalFormChange("confirmPassword", value)
              }
              required={!editingId}
              error={modalFormErrors.confirmPassword}
              disabled={modalLoading}
            />

            {/* Department */}
            <div>
              <label
                className="block mb-2 text-[16px] font-semibold leading-none"
                style={{ color: "#002075", fontFamily: "Inter" }}
              >
                Department <span className="text-red-600">*</span>
              </label>
              <Dropdown
                options={DEPARTMENT_OPTIONS.map((dept) => ({
                  id: dept,
                  label: dept,
                  value: dept,
                }))}
                placeholder="Select department"
                selectedValue={modalFormData.department}
                onSelect={(opt) =>
                  handleModalFormChange("department", String(opt.value))
                }
                disabled={modalLoading}
                error={modalFormErrors.department}
                variant="secondary"
              />
            </div>

            {/* Permission */}
            <div>
              <label
                className="block mb-2 text-[16px] font-semibold leading-none"
                style={{ color: "#002075", fontFamily: "Inter" }}
              >
                Permission <span className="text-red-600">*</span>
              </label>
              <Dropdown
                options={PERMISSION_OPTIONS.map((perm) => ({
                  id: perm,
                  label: perm,
                  value: perm,
                }))}
                placeholder="Select permission"
                selectedValue={modalFormData.permission}
                onSelect={(opt) =>
                  handleModalFormChange("permission", String(opt.value))
                }
                disabled={modalLoading}
                error={modalFormErrors.permission}
                variant="secondary"
              />
            </div>

            {/* Access Control Radio Buttons */}
            <div className="mt-2">
              <label
                className="block mb-3 text-[16px] font-semibold leading-none"
                style={{ color: "#002075", fontFamily: "Inter" }}
              >
                Access Control
              </label>

              <div className="flex justify-start gap-4 w-full">
                {/* LEFT: ALLOW */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="Active"
                    checked={modalFormData.access === "Active"}
                    onChange={(e) =>
                      handleModalFormChange("access", e.target.value)
                    }
                    disabled={modalLoading}
                    className="w-4 h-4"
                    style={{
                      accentColor: "#182286",
                    }}
                  />
                  <span className="text-sm font-medium text-[#182286]">
                    Allow Access
                  </span>
                </label>

                {/* RIGHT: BLOCK */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="Blocked"
                    checked={modalFormData.access === "Blocked"}
                    onChange={(e) =>
                      handleModalFormChange("access", e.target.value)
                    }
                    disabled={modalLoading}
                    className="w-4 h-4"
                    style={{
                      accentColor: "#182286",
                    }}
                  />
                  <span className="text-sm font-medium text-[#182286]">
                    Block Access
                  </span>
                </label>
              </div>
            </div>
          </InputForms>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && approvingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <InputForms
            title="Approve Account"
            onCancel={closeApproveModal}
            onSubmit={handleApproveSubmit}
            onSecondaryAction={closeApproveModal}
            showCloseButton={true}
            width="480px"
            mode="add"
            buttonLabel="Approve"
            secondaryButtonLabel="Cancel"
            secondaryButtonVariant="white"
            buttonLoading={approveUserMutation.isPending}
            buttonDisabled={approveUserMutation.isPending}
            secondaryButtonDisabled={approveUserMutation.isPending}
          >
            <p className="text-sm text-[#667085] mb-2">
              Assign a department and permission level for{" "}
              <span className="font-semibold text-[#182286]">
                {splitName(approvingAccount.firstName, approvingAccount.lastName)}
              </span>{" "}
              ({approvingAccount.username}).
            </p>

            <div>
              <label
                className="block mb-2 text-[16px] font-semibold leading-none"
                style={{ color: "#002075", fontFamily: "Inter" }}
              >
                Department <span className="text-red-600">*</span>
              </label>
              <Dropdown
                options={DEPARTMENT_OPTIONS.map((dept) => ({
                  id: dept,
                  label: dept,
                  value: dept,
                }))}
                placeholder="Select department"
                selectedValue={approveFormData.department}
                onSelect={(opt) =>
                  handleApproveFormChange("department", String(opt.value))
                }
                disabled={approveUserMutation.isPending}
                error={approveFormErrors.department}
                variant="secondary"
              />
            </div>

            <div>
              <label
                className="block mb-2 text-[16px] font-semibold leading-none"
                style={{ color: "#002075", fontFamily: "Inter" }}
              >
                Permission <span className="text-red-600">*</span>
              </label>
              <Dropdown
                options={PERMISSION_OPTIONS.map((perm) => ({
                  id: perm,
                  label: perm,
                  value: perm,
                }))}
                placeholder="Select permission"
                selectedValue={approveFormData.permission}
                onSelect={(opt) =>
                  handleApproveFormChange("permission", String(opt.value))
                }
                disabled={approveUserMutation.isPending}
                error={approveFormErrors.permission}
                variant="secondary"
              />
            </div>
          </InputForms>
        </div>
      )}

      <ConfirmationModal
        isOpen={isSaveConfirmOpen}
        title={saveConfirmation.title}
        message={saveConfirmation.message}
        cancelLabel="Back"
        confirmLabel={editingId ? "Save Changes" : "Create Account"}
        onCancel={closeSaveConfirmation}
        onConfirm={handleConfirmSave}
        loading={modalLoading}
        disabled={modalLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
        cancelLabel="Cancel"
        confirmLabel="Delete Account"
        onCancel={closeDeleteConfirmation}
        onConfirm={handleDeleteAccount}
        loading={modalLoading}
        disabled={modalLoading}
      />

      <ConfirmationModal
        isOpen={isRejectConfirmOpen}
        title="Reject Account"
        message={`Reject ${rejectingAccount?.username ?? "this account"}? They will not be able to log in.`}
        cancelLabel="Cancel"
        confirmLabel="Reject Account"
        onCancel={closeRejectConfirmation}
        onConfirm={handleRejectConfirm}
        loading={rejectUserMutation.isPending}
        disabled={rejectUserMutation.isPending}
      />

      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="top-right"
      />
    </div>
  );
}