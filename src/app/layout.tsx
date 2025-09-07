import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Editor Pro",
  description: "Edit your PDF files with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.4)',
              },
            }}
          />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
