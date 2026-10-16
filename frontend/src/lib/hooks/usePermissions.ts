import { useCurrentUser } from "@/lib/hooks/useAuth";

export function usePermissions() {
    const { data: currentUser } = useCurrentUser();
    const roleId = Number(currentUser?.role_id);

    return {
        roleId,
        isSuperadmin: roleId === 1,
        canAdd: roleId === 1 || roleId === 2,
        canEdit: roleId === 1,
        canDelete: roleId === 1,
    };
}