import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "../services/file.service";
import { fileKeys } from "../queries/fileQueries";
import { checklistKeys } from "../queries/checklistQueries";
import { documentTypeKeys } from "../queries/documentTypeQueries";

// a file added to or removed from a required document changes that document's status on the server
const refreshFilesAndChecklist = (queryClient: ReturnType<typeof useQueryClient>, projectId: number) => {
  queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
  queryClient.invalidateQueries({ queryKey: checklistKeys.byProject(projectId) });
  queryClient.invalidateQueries({ queryKey: documentTypeKeys.completeness(projectId) });
};

export const useUploadFile = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileName, file, documentTypeId }: { fileName: string; file: File; documentTypeId?: number }) =>
      fileService.uploadFile(projectId, fileName, file, documentTypeId),
    onSuccess: () => refreshFilesAndChecklist(queryClient, projectId),
  });
};

export const useDeleteFile = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: number) => fileService.deleteFile(fileId),
    onSuccess: () => refreshFilesAndChecklist(queryClient, projectId),
  });
};


export const useUpdateFile = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: number; fileName: string }) =>
      fileService.updateFile(fileId, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
    },
  });
};