import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "../services/file.service";
import { fileKeys } from "../queries/fileQueries";

export const useUploadFile = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileName, file }: { fileName: string; file: File }) =>
      fileService.uploadFile(projectId, fileName, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
    },
  });
};

export const useDeleteFile = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: number) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
    },
  });
};