import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MainLayoutClient from "@/components/MainLayoutClient"; // To be created

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VEO | AI For Us",
  description: "VEO | AI For Us",
  icons: {
    icon: '/main_full.png', // Path to the icon in the public directory
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayoutClient>
          {/* Header can be part of MainLayoutClient or here, depending on whether it needs auth state directly before loading */} 
        <Header />
        {children}
        </MainLayoutClient>
      </body>
    </html>
  );
}
