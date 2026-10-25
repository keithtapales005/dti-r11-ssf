import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lookupService } from "../services/lookup.service";
import { lookupKeys } from "../queries/lookupQueries";
import { UpdateLookupDto } from "../types/lookup";

// project_status / user_status are also read through their own endpoints
const useRefresh = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: lookupKeys.all });
    queryClient.invalidateQueries({ queryKey: ["project-statuses"] });
  };
};

export const useCreateLookup = (list: string) => {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (name: string) => lookupService.create(list, name), onSuccess: refresh });
};

export const useUpdateLookup = (list: string) => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateLookupDto }) => lookupService.update(list, id, dto),
    onSuccess: refresh,
  });
};

export const useDeleteLookup = (list: string) => {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: number) => lookupService.remove(list, id), onSuccess: refresh });
};
