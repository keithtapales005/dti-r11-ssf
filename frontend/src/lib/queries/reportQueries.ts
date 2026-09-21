import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report.service";

export const useBottomlineAccomplishmentReport = () => {
  return useQuery({
    queryKey: ["reports", "bottomline-accomplishment"],
    queryFn: () => reportService.getBottomlineAccomplishment(),
  });
};