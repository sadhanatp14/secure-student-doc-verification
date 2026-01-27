"use client"

import type React from "react"
import { Shield, Lock, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const router = useRouter()

  // Initialize from sessionStorage
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingEmail")
    if (!pendingEmail) {
      router.push("/login")
      return
    }
    setEmail(pendingEmail)
  }, [router])

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Only allow digits
    if (value.length <= 6) {
      setOtp(value)
      setError("")
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP")
        return
      }

      if (!email) {
        setError("Email not found. Please login again.")
        return
      }

      // Verify OTP with backend
      const response = await authAPI.verifyOTP(email, otp)

      // OTP verified successfully - store token and user data
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("userRole", response.user.role)

      // Clear session storage
      sessionStorage.removeItem("pendingEmail")

      setSuccess("Login successful! Redirecting...")

      // Redirect based on role
      const role = response.user.role
      setTimeout(() => {
        if (role === "student") {
          router.push("/student/dashboard")
        } else if (role === "faculty") {
          router.push("/faculty/dashboard")
        } else if (role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      }, 1000)
    } catch (err: any) {
      // Check if max attempts reached
      if (err.maxAttemptsReached) {
        setError(err.message || "Maximum attempts reached. Redirecting to login...")
        setTimeout(() => {
          sessionStorage.removeItem("pendingEmail")
          router.push("/login")
        }, 2000)
      } else {
        setError(err.message || "Invalid OTP. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setResendLoading(true)
    setError("")

    try {
      // Call resend OTP endpoint
      const response = await fetch("http://localhost:5001/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to resend OTP")
      }

      setSuccess("OTP resent to your email!")
      setTimeLeft(300) // Reset to 5 minutes
      setCanResend(false)
      setOtp("")
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.")
    } finally {
      setResendLoading(false)
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
            <h2 className="text-3xl font-bold text-center">Crypt-o-Course</h2>
            <p className="text-muted-foreground text-center">Multi-Factor Authentication for enhanced security</p>
            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">2FA Verification</p>
                  <p className="text-muted-foreground text-xs">Email-based one-time password</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Time-Limited</p>
                  <p className="text-muted-foreground text-xs">5-minute expiration for security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Secure Delivery</p>
                  <p className="text-muted-foreground text-xs">OTP sent directly to your email</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OTP Verification Form Section */}
        <Card className="shadow-lg border-0 animate-slide-in-up">
          <CardHeader>
            <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Email:</strong> {email}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  One-Time Password
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOTPChange}
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-3xl tracking-widest border border-input bg-background rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {canResend ? (
                    <span className="text-destructive font-medium">OTP Expired</span>
                  ) : (
                    <>
                      OTP expires in <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                    </>
                  )}
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              {/* Resend Button */}
              <Button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendLoading}
                variant="outline"
                className="w-full"
              >
                {resendLoading ? "Resending..." : canResend ? "Resend OTP" : `Resend in ${formatTime(timeLeft)}`}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Not the right email? </span>
                <a href="/login" className="text-primary font-medium hover:underline">
                  Back to login
                </a>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Why Multi-Factor Authentication?</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Protects your account from unauthorized access</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Adds an extra layer of security beyond passwords</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>OTP codes are unique and time-limited</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
