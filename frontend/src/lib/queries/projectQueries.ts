import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

export const projectKeys = {
  detail: (id: number) => ["project", id] as const,
  list: (page: number, limit: number) => ["project", "list", page, limit] as const,
};

// GET SINGLE PROJECT
export const useProject = (id: number) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
};

// GET ALL PROJECTS (paginated)
export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: projectKeys.list(page, limit),
    queryFn: () => projectService.getAllProjects(page, limit),
  });
};