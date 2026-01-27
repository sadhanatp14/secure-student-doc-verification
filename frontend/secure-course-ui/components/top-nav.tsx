"use client"

import { useState, useEffect } from "react"
import { User, ChevronDown, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function TopNav() {
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUserName(localStorage.getItem("userName") || localStorage.getItem("userEmail")?.split("@")[0] || "User")
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="text-lg font-semibold">Secure Course Enrollment System</div>

        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <User className="w-5 h-5 text-primary" />
              <div className="text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    localStorage.removeItem("authToken")
                    localStorage.removeItem("userRole")
                    localStorage.removeItem("userEmail")
                    localStorage.removeItem("userName")
                    window.location.href = "/login"
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors text-destructive"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
