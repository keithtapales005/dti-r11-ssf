import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accomplishmentService } from "../services/accomplishment.service";
import { accomplishmentKeys } from "../queries/accomplishmentQueries";
import { UpsertAccomplishmentDto } from "../types/accomplishment";

export const useUpsertAccomplishment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertAccomplishmentDto) => accomplishmentService.upsert(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: accomplishmentKeys.byProject(variables.project_id) });
    },
  });
};