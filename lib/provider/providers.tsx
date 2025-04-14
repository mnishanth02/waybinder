"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { ModalProvider } from "./modal-provider";
import QueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NextTopLoader
        color="#d34936"
        shadow="0 0 10px #d34936,0 0 5px #d34936"
        showSpinner={false}
      />
      <TooltipProvider>
        <ModalProvider />
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
        </NuqsAdapter>
      </TooltipProvider>
      <Toaster
        position="bottom-right"
        richColors
        duration={3000}
        toastOptions={{ style: { textAlign: "center" } }}
      />
      {/* TODO : pls uncomment before production */}
      {/* <Analytics /> */}
      {/* <SpeedInsights /> */}
    </ThemeProvider>
  );
}
