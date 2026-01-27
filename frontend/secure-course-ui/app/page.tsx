"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect based on auth and role
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userData)
      const role = user.role

      if (role === "student") {
        router.push("/student/dashboard")
      } else if (role === "faculty") {
        router.push("/faculty/dashboard")
      } else if (role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch {
      router.push("/login")
    }
  }, [router])

  return null
}
