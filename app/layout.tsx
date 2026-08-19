import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerClue | AI Due Diligence Copilot (Hybrid Architecture)",
  description: "Production-grade M&A financial RAG platform powered by Qdrant 2048-dim vector payloads, Nemotron embeddings, and layout-aware table parsers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
