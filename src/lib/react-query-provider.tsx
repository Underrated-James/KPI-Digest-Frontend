"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "./api-error";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


function shouldShowErrorToast(meta: Record<string, unknown> | undefined) {
  return meta?.showErrorToast !== false;
}

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (!shouldShowErrorToast(query.meta)) {
              return;
            }

            toast.error(extractErrorMessage(error));
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (!shouldShowErrorToast(mutation.meta)) {
              return;
            }

            toast.error(extractErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 min
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        />
      ) : null}
    </QueryClientProvider>
  );
}
