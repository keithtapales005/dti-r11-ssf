import { useQuery } from "@tanstack/react-query";
import { projectStatusService } from "../services/projectStatus.service";

export const useProjectStatuses = () => {
  return useQuery({
    queryKey: ["project-statuses"],
    queryFn: projectStatusService.getProjectStatuses,
  });
};