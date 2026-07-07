import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { userKeys } from "./userQueries";
import { CreateUserDto, UpdateUserDto } from "../types/user";

// CREATE USER
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.createUser(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
};

// EDIT USER
export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: UpdateUserDto;
    }) => userService.editUser(id, dto),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
};