"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI, courseAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Edit, BookOpen, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ManageCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "faculty") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchMyCourses()
  }, [router])

  const fetchMyCourses = async () => {
    try {
      setLoading(true)
      const allCourses = await enrollmentAPI.getAllCourses()
      // Filter to show only courses created by this faculty
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const myCourses = allCourses.filter((course: any) => course.faculty?._id === userData.id)
      setCourses(myCourses)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course? This action cannot be undone.")
    if (!confirmDelete) return

    try {
      setLoading(true)
      await courseAPI.deleteCourse(courseId)
      await fetchMyCourses()
    } catch (err) {
      console.error("Failed to delete course:", err)
      alert("Failed to delete course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="animate-slide-in-up">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/faculty/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          View and edit courses you've created - {courses.length} course(s)
        </p>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No courses created yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first course to get started</p>
              <Link href="/dashboard/create-course">
                <Button>Create Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {course.courseName}
                    </CardTitle>
                    <CardDescription>Code: {course.courseCode}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/edit-course/${course._id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(course._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Description</p>
                  <p className="text-sm">{course.description}</p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
