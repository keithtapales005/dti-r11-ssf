import { useQuery } from "@tanstack/react-query";
import { supplyService } from "../services/supply.service";

export const supplyKeys = {
  all: ["supplies"] as const,
  lists: () => [...supplyKeys.all, "list"] as const,
  list: (projectId: number) => [...supplyKeys.lists(), projectId] as const,
};

export const useSupplies = (projectId: number) => {
  return useQuery({
    queryKey: supplyKeys.list(projectId),
    queryFn: () => supplyService.getSuppliesForProject(projectId),
    enabled: !!projectId,
  });
};