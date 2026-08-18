import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { brand } from "@/brand/brand";

export const metadata: Metadata = {
  title: "MJC Chatbot",
  description: "Assistant conversationnel de la MJC de Fécamp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        style={
          {
            ["--brand-accent" as string]: brand.colors.accent,
            ["--brand-accent2" as string]: brand.colors.accent2,
            ["--brand-text" as string]: brand.colors.text,
            ["--brand-text-muted" as string]: brand.colors.textMuted,
            ["--brand-surface-solid" as string]: brand.colors.surfaceSolid,
            ["--brand-border" as string]: brand.colors.border,
            ["--brand-bg" as string]: brand.colors.background,
            ["--brand-bg2" as string]: brand.colors.background2,
            ["--brand-danger" as string]: brand.colors.danger,
            ["--brand-success-bg" as string]: brand.colors.successBg,
            ["--brand-success-text" as string]: brand.colors.successText,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
