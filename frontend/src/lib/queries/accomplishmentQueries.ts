import { useQuery } from "@tanstack/react-query";
import { accomplishmentService } from "../services/accomplishment.service";

export const accomplishmentKeys = {
  byProject: (projectId: number) => ["accomplishment", "project", projectId] as const,
};

// GET ACCOMPLISHMENT DATA FOR A PROJECT
export const useAccomplishmentByProject = (projectId: number) => {
  return useQuery({
    queryKey: accomplishmentKeys.byProject(projectId),
    queryFn: () => accomplishmentService.getByProject(projectId),
    enabled: !!projectId,
  });
};