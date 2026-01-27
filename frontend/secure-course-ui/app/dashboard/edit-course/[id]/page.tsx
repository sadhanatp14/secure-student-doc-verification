"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { courseAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string

  const [userRole, setUserRole] = useState<string>("")
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    coursePlan: "",
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

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

    if (courseId) {
      fetchCourseData()
    }
  }, [router, courseId])

  const fetchCourseData = async () => {
    try {
      setFetching(true)
      const course = await courseAPI.viewCourse(courseId)
      
      if (!course) {
        alert("Course not found")
        router.push("/faculty/manage-courses")
        return
      }

      // Check if the current user is the faculty who created this course
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      if (course.faculty?._id !== userData.id) {
        alert("You can only edit courses you created")
        router.push("/faculty/manage-courses")
        return
      }

      setFormData({
        courseCode: course.courseCode || "",
        courseName: course.courseName || "",
        description: course.description || "",
        coursePlan: course.coursePlan || "",
      })
    } catch (error) {
      console.error("Failed to fetch course:", error)
      alert("Failed to load course data")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await courseAPI.updateCourse(
        courseId,
        formData.courseCode,
        formData.courseName,
        formData.description,
        formData.coursePlan
      )

      alert("Course updated successfully! Data encrypted and the full record digitally signed.")
      router.push("/faculty/manage-courses")
    } catch (error) {
      console.error("Failed to update course:", error)
      alert("Failed to update course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="p-8 max-w-2xl w-full animate-slide-in-up">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/faculty/manage-courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Course</h1>
        </div>
        <p className="text-muted-foreground ml-12">Update course information below</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Course Information
          </CardTitle>
          <CardDescription>Modify course details as needed</CardDescription>
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
              <label className="text-sm font-medium">Description (Public)</label>
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/faculty/manage-courses")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Updating..." : "Update Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
