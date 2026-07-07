import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export const authKeys = {
  currentUser: ["auth","me"] as const,
};



// GET SELF USER
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
  });
};
