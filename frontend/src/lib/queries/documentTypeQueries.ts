import { useQuery } from "@tanstack/react-query";
import { documentTypeService } from "../services/documentType.service";

export const documentTypeKeys = {
  all: ["document-type"] as const,
  completeness: (projectId: number) => ["document-type", "completeness", projectId] as const,
};

export const useDocumentTypes = () => {
  return useQuery({
    queryKey: documentTypeKeys.all,
    queryFn: () => documentTypeService.getAll(),
  });
};

export const useProjectCompleteness = (projectId: number) => {
  return useQuery({
    queryKey: documentTypeKeys.completeness(projectId),
    queryFn: () => documentTypeService.getCompleteness(projectId),
    enabled: !!projectId,
  });
};