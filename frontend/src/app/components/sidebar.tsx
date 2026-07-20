"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiClock,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMapPin,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import {useMutation} from "@tanstack/react-query";
import {useLogout} from "@/lib/hooks/useAuth";
type SidebarUser = {
  displayName?: string;
  username?: string;
  initials?: string;
  avatarUrl?: string;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: IconType;
  exact?: boolean;
};

type SidebarProvinceItem = {
  label: string;
  href: string;
};

export interface SidebarProps {
  user?: SidebarUser;
  className?: string;
  defaultCollapsed?: boolean;
  onLogout?: () => void;
  overlay?: boolean;
}

type StoredUser = {
  username?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
};

const PROVINCES: SidebarProvinceItem[] = [
  { label: "Davao City", href: "/project-page?province=Davao%20City" },
  { label: "Davao de Oro", href: "/project-page?province=Davao%20de%20Oro" },
  { label: "Davao del Norte", href: "/project-page?province=Davao%20del%20Norte" },
  { label: "Davao del Sur", href: "/project-page?province=Davao%20del%20Sur" },
  { label: "Davao Occidental", href: "/project-page?province=Davao%20Occidental" },
  { label: "Davao Oriental", href: "/project-page?province=Davao%20Oriental" },
];

const PRIMARY_ITEMS: SidebarItem[] = [
  { label: "Dashboard", href: "/", icon: FiHome, exact: true },
];

const MANAGEMENT_ITEMS: SidebarItem[] = [
  { label: "Accounts", href: "/account-page", icon: FiUsers },
];

const MONITORING_ITEMS: SidebarItem[] = [
  { label: "Reports", href: "/approved-status-page", icon: FiFileText },
  { label: "Activity Logs", href: "/file-page", icon: FiClock },
];

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("user");
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function buildSidebarUser(storedUser: StoredUser | null, fallback?: SidebarUser) {
  const username = fallback?.username || storedUser?.username || "Logged In User";
  const firstName = storedUser?.first_name || storedUser?.firstName || "";
  const lastName = storedUser?.last_name || storedUser?.lastName || "";
  const displayName =
    fallback?.displayName ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    username;

  const initialsFromName = [firstName, lastName]
    .filter(Boolean)
    .map((value) => value.charAt(0))
    .join("");
  const initialsFromUsername = username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value.charAt(0))
    .join("");

  return {
    displayName,
    username,
    initials:
      fallback?.initials || initialsFromName || initialsFromUsername || "U",
    avatarUrl: fallback?.avatarUrl,
  };
}

function matchesPath(pathname: string, href: string, exact = false) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  user,
  className = "",
  defaultCollapsed = false,
  onLogout,
  overlay = false,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isProvinceExpanded, setIsProvinceExpanded] = useState(true);
   const { data: currentUser, isLoading, error } = useCurrentUser();
   const { mutate: logout } = useLogout();
  const [sidebarUser, setSidebarUser] = useState<SidebarUser>(() =>
    buildSidebarUser(null, user),
  );

  useEffect(() => {
    const storedUser = readStoredUser();
    setSidebarUser(buildSidebarUser(storedUser, user));
  }, [user]);

  const activeProvince = useMemo(
    () => PROVINCES.some((province) => matchesPath(pathname, province.href)),
    [pathname],
  );

  const resolveItemClassName = (active: boolean) =>
    [
      "group flex w-full items-center rounded-[6px] px-3 py-3 text-[15px] font-medium transition-colors duration-200",
      isCollapsed ? "justify-center gap-0" : "justify-start gap-3",
      active ? "bg-[#2B3BB2] text-white" : "text-white/90 hover:bg-white/10",
    ].join(" ");

  const sectionLabelClassName =
    "text-[14px] font-semibold tracking-[0.16em] text-white/60 uppercase";
    
  return (
    <aside
  className={`flex h-screen shrink-0 border-r border-white/10
    bg-[#182286]
    shadow-[4px_0_4px_0_rgba(0,0,0,0.25)]
    transition-[width] duration-300 ease-out
    ${isCollapsed ? "w-[120px]" : "w-[301px]"}
    ${overlay ? "fixed top-0 left-0 z-50" : "relative"}
    ${className}`}
>
      <div className="flex h-full min-h-full w-full flex-col gap-6 overflow-y-auto px-4 py-8 text-white">
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        <div className={`flex flex-col items-center gap-3 ${isCollapsed ? "pt-1" : "pt-2"}`}>
          <div className={`relative ${isCollapsed ? "h-12 w-12" : "h-14 w-28"}`}>
            <Image
              src="/ssf-logo.png"
              alt="SSF Logo"
              fill
              sizes="(max-width: 768px) 48px, 112px"
              className="object-contain"
              priority
            />
          </div>

          {!isCollapsed && (
            <div className="text-center leading-tight">
              <p className="text-[17px] font-semibold">Shared Service Facilities</p>
              <p className="text-[11px] italic text-white/75">
                "Shared Success for Filipino MSMEs"
              </p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-4" aria-label="Sidebar navigation">
          <div className="flex flex-col gap-2">
            {PRIMARY_ITEMS.map((item) => {
              const active = matchesPath(pathname, item.href, item.exact);
              return (
                <Link key={item.label} href={item.href} className={resolveItemClassName(active)}>
                  <item.icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 border-t border-white/15 pt-4">
            {!isCollapsed && <p className={sectionLabelClassName}>Management</p>}

            {MANAGEMENT_ITEMS.map((item) => {
              const active = matchesPath(pathname, item.href, item.exact);
              return (
                <Link key={item.label} href={item.href} className={resolveItemClassName(active)}>
                  <item.icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            <div className="rounded-[6px]">
              <button
                type="button"
                onClick={() => setIsProvinceExpanded((current) => !current)}
                className={resolveItemClassName(activeProvince)}
                aria-expanded={isProvinceExpanded}
                aria-controls="sidebar-province-list"
              >
                <FiMapPin size={20} className="shrink-0" />
                {!isCollapsed && <span className="flex-1 truncate text-left">Provinces</span>}
                {!isCollapsed && (
                  <FiChevronDown
                    size={18}
                    className={`shrink-0 transition-transform ${isProvinceExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                )}
              </button>

              {!isCollapsed && isProvinceExpanded && (
                <div
                  id="sidebar-province-list"
                  className="mt-2 flex flex-col gap-1 border-l border-white/25 pl-4"
                >
                  {PROVINCES.map((province) => (
                    <Link
                      key={province.label}
                      href={province.href}
                      className={`rounded-[6px] px-3 py-2 text-[14px] text-white/85 transition-colors hover:bg-white/10 hover:text-white ${
                        matchesPath(pathname, province.href) ? "bg-white/10 text-white" : ""
                      }`}
                    >
                      {province.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/15 pt-4">
            {!isCollapsed && <p className={sectionLabelClassName}>Monitoring</p>}

            {MONITORING_ITEMS.map((item) => {
              const active = matchesPath(pathname, item.href, item.exact);
              return (
                <Link key={item.label} href={item.href} className={resolveItemClassName(active)}>
                  <item.icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/15 pt-4">
          <button
            type="button"
            onClick={() => {
              logout(undefined,{
                onSuccess: () => {
                  router.push("/login-page");
                }
              });
            }}
            className={`flex w-full items-center rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-white/10 ${
              isCollapsed ? "justify-center gap-0" : "gap-3"
            }`}
            aria-label="Open user profile"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#182286] font-semibold">
              {sidebarUser.initials || <FiUser size={18} />}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-white">
                  {currentUser?.first_name} {currentUser?.last_name}
                </p>
                <p className="truncate text-[11px] text-white/70">
                  {sidebarUser.username}
                </p>
              </div>
            )}

            {!isCollapsed && <FiLogOut size={16} className="shrink-0 text-white/80" />}
          </button>
        </div>
      </div>
    </aside>
  );
}