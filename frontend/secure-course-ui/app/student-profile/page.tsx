"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Users, BookOpen } from "lucide-react"

export default function StudentProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchEnrolledCourses()
  }, [router])

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)
      const data = await enrollmentAPI.getMyEnrollments()
      setEnrolledCourses(data)
    } catch (err) {
      console.error("Failed to fetch enrollments:", err)
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
    <div className="space-y-6 p-6">
      {/* Student Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">Email Address</p>
              </div>
              <p className="text-lg font-semibold break-all">{user.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">Roll Number</p>
              </div>
              <p className="text-lg font-semibold">{user.rollNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <CardTitle>Enrolled Courses</CardTitle>
          </div>
          <CardDescription>{enrolledCourses.length} course(s) enrolled</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course) => (
                <Card key={course._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{course.courseName}</h3>
                      <p className="text-sm text-gray-600">Code: {course.courseCode}</p>
                      <p className="text-sm text-gray-600">
                        Faculty: {course.faculty?.name} ({course.faculty?.email})
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No courses enrolled yet. Browse available courses to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
