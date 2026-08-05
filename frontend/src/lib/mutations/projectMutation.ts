import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../queries/projectQueries";
import { CreateProjectDto, UpdateProjectDto } from "../types/project";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectService.createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "list"] });
    },
  });
};


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

// Alias for pages expecting a shorter name
export const useEditProject = useUpdateProject;

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "list"] });
    },
  });
};