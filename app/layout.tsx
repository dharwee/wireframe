import type { Metadata } from "next";

import "./globals.css";
import Provider from "./provider";
import { Bricolage_Grotesque } from "next/font/google";

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

        <Provider>
          {children}

        </Provider>
      </body>
    </html>
  );
}
