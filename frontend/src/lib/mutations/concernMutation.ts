import { useMutation, useQueryClient } from "@tanstack/react-query";
import { concernService } from "../services/concern.service";
import { concernKeys } from "../queries/concernQueries";
import { CreateProjectConcernDto, UpdateProjectConcernDto } from "../types/concern";

export const useCreateConcern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProjectConcernDto) => concernService.createConcern(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: concernKeys.byProject(variables.project_id) });
    },
  });
};

export const useUpdateConcern = (projectId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProjectConcernDto }) =>
      concernService.updateConcern(id, dto),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: concernKeys.byProject(projectId) });
      }
    },
  });
};

// Alias for pages expecting a shorter name
export const useEditConcern = useUpdateConcern;

export const useDeleteConcern = (projectId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => concernService.deleteConcern(id),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: concernKeys.byProject(projectId) });
      }
    },
  });
};