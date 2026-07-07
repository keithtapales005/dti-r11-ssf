import {useMutation} from "@tanstack/react-query";
import { authService } from "../services/auth.service";
export const useLogin = () => 
    useMutation({
        mutationFn: authService.Login
    });
export const useLogout = () => 
    useMutation({
        mutationFn: authService.logout
    });