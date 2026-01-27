"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PendingCoursesPage() {
  const router = useRouter()
  const [pendingCourses, setPendingCourses] = useState<any[]>([])
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
    if (parsedUser.role !== "student") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchPendingCourses()
  }, [router])

  const fetchPendingCourses = async () => {
    try {
      setLoading(true)
      const data = await enrollmentAPI.getMyPendingEnrollments()
      setPendingCourses(data)
    } catch (err) {
      console.error("Failed to fetch pending courses:", err)
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
          <Link href="/student/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Approval Pending Courses</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          Courses awaiting faculty approval - {pendingCourses.length} course(s)
        </p>
      </div>

      {/* Pending Courses */}
      <div className="space-y-4">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : pendingCourses.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No pending courses</p>
              <p className="text-sm text-muted-foreground">All your enrollment requests have been processed</p>
            </CardContent>
          </Card>
        ) : (
          pendingCourses.map((enrollment) => (
            <Card key={enrollment._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-yellow-600" />
                      {enrollment.course.courseName}
                    </CardTitle>
                    <CardDescription>Code: {enrollment.course.courseCode}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{enrollment.course.description}</p>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Faculty: <span className="font-medium">{enrollment.course.faculty?.name || "Unknown"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Status: <span className="font-medium text-yellow-600">Awaiting Faculty Approval</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
