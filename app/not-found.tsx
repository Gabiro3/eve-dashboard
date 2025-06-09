"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function NotFoundPage() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png" // Replace with your actual logo path in /public
          alt="Eve Health Logo"
          width={100}
          height={100}
        />
      </div>

      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button variant="default">Return to Dashboard</Button>
      </Link>
    </div>
  )
}
