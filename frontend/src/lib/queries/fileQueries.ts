import { useQuery } from "@tanstack/react-query";
import { fileService } from "../services/file.service";

export const fileKeys = {
  byProject: (projectId: number) => ["files", "project", projectId] as const,
};

// GET ALL FILES FOR A PROJECT
export const useFilesByProject = (projectId: number) => {
  return useQuery({
    queryKey: fileKeys.byProject(projectId),
    queryFn: () => fileService.getFilesByProject(projectId),
    enabled: !!projectId,
  });
};