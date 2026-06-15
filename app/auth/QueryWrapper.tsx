"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();
export default function QueryWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
