import type { Metadata } from "next";

import "./globals.css";

import { Bricolage_Grotesque } from "next/font/google";
import { AuthContextProvider } from '../context/AuthContext';

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Wireframe to Code",
  description: "Convert your wireframe designs into code effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={`${bricolage.variable} antialiased`}>
          <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
