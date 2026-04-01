import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@fontsource-variable/cascadia-code";
import "./globals.css";

const cascadiaCode = localFont({
  src: "../../node_modules/@fontsource-variable/cascadia-code/files/cascadia-code-latin-wght-normal.woff2",
  variable: "--font-cascadia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulador de Git Rebase — Aprenda Git Rebase Visualmente",
  description:
    "Uma ferramenta interativa e visual para desenvolvedores aprenderem e praticarem Git Rebase, rebase interativo e gerenciamento de branches através de exercícios práticos.",
  keywords: [
    "git",
    "rebase",
    "rebase interativo",
    "tutorial git",
    "aprender git",
    "visualização git",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cascadiaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
