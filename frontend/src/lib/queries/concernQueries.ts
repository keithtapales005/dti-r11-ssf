import { useQuery } from "@tanstack/react-query";
import { concernService } from "../services/concern.service";

export const concernKeys = {
  byProject: (projectId: number) => ["concerns", "project", projectId] as const,
};

// GET ALL CONCERNS FOR A PROJECT
export const useConcernsByProject = (projectId: number) => {
  return useQuery({
    queryKey: concernKeys.byProject(projectId),
    queryFn: () => concernService.getConcernsByProject(projectId),
    enabled: !!projectId,
  });
};

// Alias for pages expecting a shorter name
export const useConcerns = useConcernsByProject;