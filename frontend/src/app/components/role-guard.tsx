"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";

interface RoleGuardProps {
  allowedRoleIds: number[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Keeps a page's content from mounting unless the logged-in user has an
 * allowed role. This is a UX guard only; the backend RolesGuard is what
 * actually enforces access to the data.
 */
export default function RoleGuard({
  allowedRoleIds,
  redirectTo = "/",
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const allowed =
    !!currentUser && allowedRoleIds.includes(currentUser.role_id);

  useEffect(() => {
    if (isLoading) return;
    if (isError) {
      router.replace("/login-page");
    } else if (!allowed) {
      router.replace(redirectTo);
    }
  }, [isLoading, isError, allowed, redirectTo, router]);

  if (isLoading || isError || !allowed) {
    return null;
  }

  return <>{children}</>;
}
