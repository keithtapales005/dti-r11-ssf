import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (page: number, limit: number) => [...projectKeys.lists(), page, limit] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: projectKeys.list(page, limit),
    queryFn: () => projectService.getProjects(page, limit),
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
};