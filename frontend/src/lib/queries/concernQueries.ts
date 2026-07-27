import { useQuery } from "@tanstack/react-query";
import { concernService } from "../services/concern.service";

export const concernKeys = {
  all: ["concerns"] as const,
  lists: () => [...concernKeys.all, "list"] as const,
  list: (projectId: number) => [...concernKeys.lists(), projectId] as const,
};

export const useConcerns = (projectId: number) => {
  return useQuery({
    queryKey: concernKeys.list(projectId),
    queryFn: () => concernService.getConcernsForProject(projectId),
    enabled: !!projectId,
  });
};