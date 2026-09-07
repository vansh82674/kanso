import React from 'react';
import './globals.css';

export const metadata = {
  title: 'KANSO - High-Throughput Team Productivity OS',
  description: 'A modern, high-throughput Trello-like productivity workspace with Next.js, Prisma, and Supabase PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
