import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checklistService } from "../services/checklist.service";
import { checklistKeys } from "../queries/checklistQueries";
import { CreateChecklistItemDto, UpdateChecklistItemDto } from "../types/checklist";

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateChecklistItemDto) => checklistService.createChecklistItem(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.byProject(variables.project_id) });
    },
  });
};

export const useUpdateChecklistItem = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateChecklistItemDto }) =>
      checklistService.updateChecklistItem(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.byProject(projectId) });
    },
  });
};

export const useDeleteChecklistItem = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistService.deleteChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.byProject(projectId) });
    },
  });
};