import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ghost AI",
  description: "Authenticated AI editor workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <ClerkProvider
          afterMultiSessionSingleSignOutUrl="/sign-in"
          afterSignOutUrl="/sign-in"
          appearance={clerkAppearance}
          signInFallbackRedirectUrl="/editor"
          signInUrl="/sign-in"
          signUpFallbackRedirectUrl="/editor"
          signUpUrl="/sign-up"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
