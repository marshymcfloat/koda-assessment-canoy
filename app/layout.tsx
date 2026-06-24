import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectStoreProvider } from "@/components/projects/projects-store";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Atlas — Client Project Tracker",
  description:
    "Track client projects for a digital agency: status, priority, timelines and delivery at a glance.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        inter.variable,
        spaceGrotesk.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AppHeader />
          {/* Provider spans the list, the inline delete, and the @modal /
              full-page forms so they all share one optimistic store. */}
          <ProjectStoreProvider>
            <main className="flex-1">{children}</main>
            {modal}
          </ProjectStoreProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
