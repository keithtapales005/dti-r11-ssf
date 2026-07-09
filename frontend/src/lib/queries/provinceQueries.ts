import { useQuery } from "@tanstack/react-query";
import { provinceService } from "../services/province.service";

export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: provinceService.getProvinces,
  });
};