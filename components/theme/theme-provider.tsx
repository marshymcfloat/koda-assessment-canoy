"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes: class-based dark mode, system default, persisted to
 * localStorage. next-themes injects a blocking inline script that sets the
 * `.dark` class before paint, preventing a flash on reload (works with the
 * `suppressHydrationWarning` on <html>).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
