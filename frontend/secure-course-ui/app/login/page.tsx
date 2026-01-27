"use client"

import type React from "react"
import { Shield } from "lucide-react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Please fill in all fields")
        return
      }

      // Call API to login
      const response = await authAPI.login(email, password)
      
      // Store auth token and user data
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("userRole", response.user.role)

      // Redirect based on role
      const role = response.user.role
      if (role === "student") {
        router.push("/student/dashboard")
      } else if (role === "faculty") {
        router.push("/faculty/dashboard")
      } else if (role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Illustration Section */}
        <div className="hidden md:flex flex-col justify-center items-center space-y-6">
          <div className="relative w-48 h-48 mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-45"></div>
            <div className="absolute inset-8 bg-primary/20 rounded-3xl rotate-45"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-center">Protected Access</h2>
            <p className="text-muted-foreground text-center">Enterprise-grade course management</p>
            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Zero-Trust Security</p>
                  <p className="text-muted-foreground text-xs">Every access verified and logged</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Encrypted Data</p>
                  <p className="text-muted-foreground text-xs">AES-256 encryption standard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">RBAC Enforced</p>
                  <p className="text-muted-foreground text-xs">Role-based access control</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <Card className="shadow-lg border-0 animate-slide-in-up">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Access your secure course enrollment system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border border-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded" />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <a href="/register" className="text-primary font-medium hover:underline">
                  Register here
                </a>
              </div>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs bg-secondary/50 p-3 rounded-lg">
                <p>
                  <strong>Student:</strong> test@student.com / test123
                </p>
                <p>
                  <strong>Faculty:</strong> testfac@faculty.com / fac123
                </p>
                <p>
                  <strong>Admin:</strong> admin@example.com / admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
