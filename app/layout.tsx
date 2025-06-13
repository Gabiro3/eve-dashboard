import type React from "react"
import type { Metadata } from "next"
import { Quicksand } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const quicksand = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eve Blogs | Learn about women reproductive health and wellness",
  description: "Our collection of learning resources about women's reproductive health and wellness.",
  keywords: ["reproductive health", "women's health", "health education", "wellness", "Eve Blogs"],
  icons: {
    icon: "/logo.png", // This sets your favicon
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
