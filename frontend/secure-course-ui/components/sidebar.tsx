"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Plus, Eye, LogOut, Menu, X, Shield, CheckCircle } from "lucide-react"

export function Sidebar() {
  const [userRole, setUserRole] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ...(userRole === "faculty"
      ? [
          { label: "Create Course", icon: Plus, path: "/dashboard/create-course" },
          { label: "View Course", icon: Eye, path: "/dashboard/view-course" },
        ]
      : []),
    ...(userRole === "admin"
      ? [
          { label: "Approve Course", icon: CheckCircle, path: "/dashboard/approve-course" },
          { label: "Invite Management", icon: Shield, path: "/dashboard/admin-invites" },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col ${
          isOpen ? "fixed inset-y-0 left-0 z-40 md:static" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 pt-8 md:pt-0">
            <BookOpen className="w-6 h-6 text-sidebar-primary" />
            <h2 className="text-lg font-bold">CourseHub</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
