"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft, Loader2 } from "lucide-react"
import { courseAPI } from "@/lib/api"

export default function CreateCoursePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    coursePlan: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userJson = localStorage.getItem("user")
    const parsedUser = userJson ? JSON.parse(userJson) : null
    const role = parsedUser?.role || localStorage.getItem("userRole") || ""

    setUserRole(role)

    if (!token || !parsedUser) {
      router.push("/login")
      return
    }

    if (role !== "faculty" && role !== "admin") {
      router.push("/unauthorized")
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await courseAPI.createCourse(
        formData.courseCode,
        formData.courseName,
        formData.description,
        formData.coursePlan
      )
      alert("Course created successfully! Data encrypted and the full record digitally signed.")
      setFormData({ courseCode: "", courseName: "", description: "", coursePlan: "" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="p-8 max-w-2xl w-full animate-slide-in-up">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/faculty/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Create New Course</h1>
          </div>
          <p className="text-muted-foreground ml-12">All course data will be encrypted and digitally signed for security</p>
        </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Course Information
          </CardTitle>
          <CardDescription>Provide course details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Code</label>
              <Input
                type="text"
                placeholder="e.g., CS101"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                required
                className="bg-background border border-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Name</label>
              <Input
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                required
                className="bg-background border border-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Public overview, objectives, prerequisites"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Details (Encrypted)
              </label>
              <textarea
                placeholder="Detailed course plan, weekly breakdown, assessments"
                value={formData.coursePlan}
                onChange={(e) => setFormData({ ...formData, coursePlan: e.target.value })}
                required
                rows={5}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Security Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Details are encrypted with AES-256; the entire course record is digitally signed to ensure integrity.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Creating Course..." : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
