import type React from "react"
import type { Metadata } from "next"
import { Quicksand } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const quicksand = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eve Health Admin Dashboard",
  description: "Admin dashboard for Eve Health reproductive health platform",
  keywords: ["healthcare", "reproductive health", "admin dashboard"],
    generator: 'v0.dev'
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
