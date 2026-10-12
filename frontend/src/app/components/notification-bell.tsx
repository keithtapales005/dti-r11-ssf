"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import {
    useNotifications,
    useUnreadCount,
    useMarkAsRead,
    useMarkAllAsRead,
} from "@/lib/hooks/useNotifications";
import type { NotificationEntry } from "@/lib/types/notifications";

const SUPERADMIN_ROLE_ID = 1;

function timeAgo(iso: string) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function getDestination(n: NotificationEntry) {
    if (n.reference_table === "users") return "/account-page";
    if (n.reference_table === "files") return "/file-page";
    return null;
}

export default function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: currentUser } = useCurrentUser();
    const isSuperadmin = currentUser?.role_id === SUPERADMIN_ROLE_ID;

    const { data: unread } = useUnreadCount(isSuperadmin);
    const { data: list, isLoading } = useNotifications(
        { page: 1, limit: 10 },
        isSuperadmin && open,
    );
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    // Close the dropdown when clicking outside of it
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!isSuperadmin) return null;

    const count = unread?.count ?? 0;
    const notifications = list?.data ?? [];

    const handleClick = (n: NotificationEntry) => {
        if (!n.is_read) markAsRead.mutate(n.id);
        const destination = getDestination(n);
        setOpen(false);
        if (destination) router.push(destination);
    };

    return (
        <div ref={containerRef} className="fixed top-4 right-6 z-40">
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md hover:bg-blue-50 transition-colors"
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#182286"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[11px] font-semibold text-white">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-lg border border-[#D5DAE8] bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#D5DAE8] px-4 py-3">
                        <h3 className="text-sm font-semibold text-[#182286]">Notifications</h3>
                        <button
                            onClick={() => markAllAsRead.mutate()}
                            disabled={count === 0 || markAllAsRead.isPending}
                            className="text-xs font-medium text-[#2563EB] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <p className="px-4 py-8 text-center text-sm text-[#667085]">Loading…</p>
                        ) : notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-[#667085]">
                                No notifications yet.
                            </p>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`flex w-full items-start gap-3 border-b border-[#EEF2FF] px-4 py-3 text-left hover:bg-[#F5F8FF] ${n.is_read ? "bg-white" : "bg-[#EEF2FF]"
                                        }`}
                                >
                                    <span
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-[#2563EB]"
                                            }`}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm text-[#3A3A3A]">{n.message}</p>
                                        <p className="mt-0.5 text-xs text-[#667085]">{timeAgo(n.created_at)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}