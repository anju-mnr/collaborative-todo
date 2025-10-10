/// <reference path="./globals.d.ts" />
import "./globals.css";
import "@/app/lib/airstate.client";  // <-- add this line (side-effect import)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TodoProvider } from "@/app/contexts/TodoContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaborative To-Do",
  description: "A real-time collaborative to-do list",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 overflow-x-hidden`}>
        <TodoProvider>{children}</TodoProvider>
      </body>
    </html>
  );
}
