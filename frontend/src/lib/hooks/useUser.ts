import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { userService } from "../services/user.service";
import {
  CreateUserDto,
  UpdateUserDto,
} from "../types/user";

// Queries

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

// Mutations

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) =>
      userService.createUser(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

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
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
      });
    },
  });
};