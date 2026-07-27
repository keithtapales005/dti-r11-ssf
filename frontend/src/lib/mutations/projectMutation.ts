import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../queries/projectQueries";
import { UpdateProjectDto } from "../types/project";


export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProjectDto }) =>
      projectService.updateProject(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
};