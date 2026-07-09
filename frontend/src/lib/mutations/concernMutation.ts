import { useMutation, useQueryClient } from "@tanstack/react-query";
import { concernService } from "../services/concern.service";
import { concernKeys } from "../queries/concernQueries";
import { CreateConcernDto, UpdateConcernDto } from "../types/concern";

export const useCreateConcern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateConcernDto) => concernService.createConcern(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: concernKeys.list(variables.project_id) });
    },
  });
};

export const useEditConcern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateConcernDto }) =>
      concernService.editConcern(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
    },
  });
};

export const useDeleteConcern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => concernService.deleteConcern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
    },
  });
};