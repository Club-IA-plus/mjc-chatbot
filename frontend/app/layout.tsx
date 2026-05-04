import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJC Chatbot",
  description: "MJC Fécamp assistant (scaffold)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
