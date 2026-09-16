"use client";
import { useCallback, useMemo, useState } from "react";
import SearchBar from "../../components/search-bar";
import ProfileBadge from "../../components/profile-badge";
import Pagination from "../../components/pagination";
import Dropdown, { DropdownOption } from "../../components/dropdown";
import { useLogs } from "../../../lib/hooks/useLogs";
import { useUsers } from "../../../lib/hooks/useUser";

const PERMISSION_FILTER_OPTIONS: DropdownOption[] = [
    { id: "all", label: "All Permissions", value: "" },
    { id: "1", label: "Superadmin", value: "1" },
    { id: "2", label: "Admin", value: "2" },
    { id: "3", label: "Viewer", value: "3" },
];

function formatDateTime(isoString: string) {
    const d = new Date(isoString);
    const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return { date, time };
}

export default function ActivityLogPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [permissionFilter, setPermissionFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 7;

    const { data: rawUsers = [] } = useUsers();

    const USER_FILTER_OPTIONS: DropdownOption[] = useMemo(() => {
        return [
            { id: "all", label: "All Users", value: "" },
            ...rawUsers.map((u: any) => ({
                id: String(u.user_id),
                label: `${u.first_name} ${u.last_name}`,
                value: String(u.user_id),
            })),
        ];
    }, [rawUsers]);

    const { data, isLoading } = useLogs({
        page: currentPage,
        limit,
        date: dateFilter || undefined,
        user_id: userFilter ? Number(userFilter) : undefined,
        role_id: permissionFilter ? Number(permissionFilter) : undefined,
        search: searchQuery || undefined,
    });

    const logs = data?.data ?? [];
    const totalPages = data?.totalPages ?? 1;

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    }, []);

    const handleFilterChange = useCallback(
        (setter: (v: string) => void) => (value: string) => {
            setter(value);
            setCurrentPage(1);
        },
        [],
    );

    return (
        <div className="min-h-screen bg-[#EAF0FF] text-[#182286] pt-20">
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-wide text-[#182286]">
                        Activity Log
                    </h1>
                </div>

                <div className="mb-5">
                    <SearchBar onSearch={handleSearch} placeholder="Search" />
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                    <Dropdown
                        options={[
                            { id: "all", label: "Date ▼", value: "" },
                        ]}
                        placeholder="Date ▼"
                        selectedValue={dateFilter}
                        onSelect={(opt) => handleFilterChange(setDateFilter)(String(opt.value))}
                        variant="primary"
                    />
                    <Dropdown
                        options={USER_FILTER_OPTIONS}
                        placeholder="User ▼"
                        selectedValue={userFilter}
                        onSelect={(opt) => handleFilterChange(setUserFilter)(String(opt.value))}
                        variant="primary"
                    />
                    <Dropdown
                        options={PERMISSION_FILTER_OPTIONS}
                        placeholder="Permission ▼"
                        selectedValue={permissionFilter}
                        onSelect={(opt) => handleFilterChange(setPermissionFilter)(String(opt.value))}
                        variant="primary"
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-[#D5DAE8] bg-white">
                    <div className="overflow-x-auto">
                        <div className="min-w-200">
                            <div className="grid grid-cols-[1.2fr_1.8fr_1fr_2.5fr] bg-[#202B90] px-8 py-4 text-sm font-semibold text-white">
                                <div>Date and Time</div>
                                <div>User</div>
                                <div>Permission</div>
                                <div>Description</div>
                            </div>
                            <div className="divide-y divide-[#D5DAE8] bg-[#F8FAFF]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                                        <p className="text-sm text-[#667085]">Loading activity…</p>
                                    </div>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => {
                                        const { date, time } = formatDateTime(log.created_at);
                                        return (
                                            <div
                                                key={log.id}
                                                className="grid grid-cols-[1.2fr_1.8fr_1fr_2.5fr] items-center px-6 py-4 text-sm sm:px-8"
                                            >
                                                <div>
                                                    <div className="text-[#3A3A3A]">{date}</div>
                                                    <div className="text-xs text-[#667085]">{time}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ProfileBadge
                                                        firstName={log.user?.first_name ?? ""}
                                                        lastName={log.user?.last_name ?? ""}
                                                        userId={String(log.user?.user_id ?? "unknown")}
                                                        isOnline={false}
                                                    />
                                                    <span className="truncate text-[#3A3A3A]">
                                                        {log.user ? `${log.user.first_name} ${log.user.last_name}` : "Unknown User"}
                                                    </span>
                                                </div>
                                                <div className="text-[#3A3A3A]">{log.permission}</div>
                                                <div className="text-[#3A3A3A]">{log.description}</div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                                        <h3 className="text-lg font-semibold text-[#182286]">
                                            No activity found
                                        </h3>
                                        <p className="mt-1 text-sm text-[#667085]">
                                            Try adjusting your filters.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </main>
        </div>
    );
}