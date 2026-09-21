import { useQuery } from "@tanstack/react-query";
import { logsService } from "../services/logs.service";
import { GetLogsParams } from "../types/logs";

export const useLogs = (params: GetLogsParams) => {
    return useQuery({
        queryKey: ["logs", params],
        queryFn: () => logsService.getLogs(params),
    });
};