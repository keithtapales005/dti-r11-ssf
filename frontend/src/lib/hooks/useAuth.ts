// hooks/useLogin.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { LoginDto, RegisterDto } from "../types/auth";
import { authKeys } from "../queries/authQueries";
export const useLogin = (options?: any) =>
  useMutation({
    mutationFn: (data: LoginDto) => authService.Login(data),
    ...options,
  });

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
  });
}
export const useLogout = (options?: any) =>
  useMutation({
    mutationFn: () => authService.logout(),
    ...options,
  });

export const useRegister = (options?: any) =>
  useMutation({
    mutationFn: (data: RegisterDto) => authService.Register(data),
    ...options,
  });