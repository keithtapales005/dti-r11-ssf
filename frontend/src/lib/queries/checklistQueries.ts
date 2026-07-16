import { useQuery } from "@tanstack/react-query";
import { checklistService } from "../services/checklist.service";

export const checklistKeys = {
  byProject: (projectId: number) => ["checklist", "project", projectId] as const,
};

// GET CHECKLIST + PROGRESS FOR A PROJECT
export const useChecklistByProject = (projectId: number) => {
  return useQuery({
    queryKey: checklistKeys.byProject(projectId),
    queryFn: () => checklistService.getChecklistByProject(projectId),
    enabled: !!projectId,
  });
};