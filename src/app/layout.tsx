import type { Metadata } from "next";
import "./globals.css";
import 'react-tooltip/dist/react-tooltip.css';
import Header from "@/components/Header"; // Assuming @ is configured for src

export const metadata: Metadata = {
  title: "Veo",
  description: "Veo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
