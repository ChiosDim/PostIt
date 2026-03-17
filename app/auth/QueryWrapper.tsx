"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface Props {
  children?: ReactNode;
}

const client = new QueryClient();
export default function QueryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
