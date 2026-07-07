import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// GET ALL USERS
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userService.getUsers,
  });
};

// GET SINGLE USER
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};