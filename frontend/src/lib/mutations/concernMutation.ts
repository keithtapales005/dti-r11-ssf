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

export const useUpdateConcern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProjectConcernDto }) =>
      concernService.updateConcern(id, dto),
    onSuccess: (_data, _variables, context: any) => {
      // We'll pass projectId through context when calling this, so we know which cache to invalidate
    },
  });
};