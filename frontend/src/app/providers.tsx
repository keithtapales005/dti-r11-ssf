"use client"; // REQUIRED

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import PermissionDeniedModal from "@/app/components/permission-denied-modal";
import { getStatusCode } from "@/lib/utils/errors";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (getStatusCode(error) === 403) setPermissionDenied(true);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (getStatusCode(error) === 403) setPermissionDenied(true);
          },
        }),
        defaultOptions: {
          queries: {
            // Retrying a 401/403 can't succeed, so fail immediately instead
            // of waiting through the default retries.
            retry: (failureCount, error) => {
              const status = getStatusCode(error);
              if (status === 401 || status === 403) return false;
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <PermissionDeniedModal
        open={permissionDenied}
        onClose={() => setPermissionDenied(false)}
      />
    </QueryClientProvider>
  );
}
