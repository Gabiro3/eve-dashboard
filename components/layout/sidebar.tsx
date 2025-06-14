"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  Heart,
  Settings,
  UserCheck,
  Smartphone,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  SmileIcon,
} from "lucide-react"

interface SidebarProps {
  userRole: string
}

const navigationItems = {
  admin: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Blog Posts", href: "/dashboard/posts", icon: FileText },
    { name: "Quizzes", href: "/dashboard/quizzes", icon: SmileIcon },
    { name: "Dashboard Users", href: "/dashboard/users", icon: Users },
    { name: "Access Requests", href: "/dashboard/access-requests", icon: UserPlus },
    { name: "App Users", href: "/dashboard/app-users", icon: Smartphone },
    { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
    { name: "Donations", href: "/dashboard/donations", icon: Heart },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  writer: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Articles", href: "/dashboard/posts", icon: FileText },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  doctor: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Article Reviews", href: "/dashboard/reviews", icon: UserCheck },
    { name: "My Articles", href: "/dashboard/posts", icon: FileText },
    { name: "Appointments", href: "/dashboard/appointments", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  // Ensure we use a valid role or default to admin
  const validRole = (userRole && ['admin', 'writer', 'doctor'].includes(userRole)) ? userRole : 'admin'
  const items = navigationItems[validRole as keyof typeof navigationItems]

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative">
              <Image
                src="/logo.png"
                alt="Eve Health Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-2 font-semibold text-gray-900">Eve Health</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-blue-50 text-primary border-primary-foreground",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</div>
            <div className="text-sm font-medium text-gray-900 capitalize">{userRole}</div>
          </div>
        </div>
      )}
    </div>
  )
}
