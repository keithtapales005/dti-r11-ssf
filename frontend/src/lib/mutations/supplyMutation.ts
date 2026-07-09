import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplyService } from "../services/supply.service";
import { supplyKeys } from "../queries/supplyQueries";
import { CreateSupplyDto, UpdateSupplyDto } from "../types/supply";

export const useCreateSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupplyDto) => supplyService.createSupply(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplyKeys.list(variables.project_id) });
    },
  });
};

export const useEditSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSupplyDto }) =>
      supplyService.editSupply(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplyKeys.all });
    },
  });
};

export const useDeleteSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplyService.deleteSupply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplyKeys.all });
    },
  });
};