"use client"

import { useEffect, useState } from "react"
import { enrollmentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CourseEnrollmentPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [pendingCourses, setPendingCourses] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch courses first (this should always work)
      const allCourses = await enrollmentAPI.getAllCourses()
      setCourses(allCourses)
      
      // Try to fetch enrollments - handle errors gracefully
      let enrolled: any[] = []
      let pending: any[] = []
      let rejected: any[] = []
      
      try {
        enrolled = await enrollmentAPI.getMyEnrollments()
        setEnrolledCourses(enrolled)
      } catch (err) {
        // Silently handle - user may have no enrollments yet
        console.log("No enrolled courses found")
      }
      
      try {
        pending = await enrollmentAPI.getMyPendingEnrollments()
        setPendingCourses(pending)
      } catch (err) {
        // Silently handle - user may have no pending courses
        console.log("No pending courses found")
      }

      try {
        rejected = await enrollmentAPI.getMyRejectedEnrollments()
      } catch (err) {
        console.log("No rejected courses found")
      }

      // Filter to show only courses that are not enrolled and not pending and not rejected
      const enrolledIds = enrolled.map((c: any) => c._id)
      const pendingIds = pending.map((p: any) => p.course?._id).filter(Boolean)
      const rejectedIds = rejected.map((r: any) => r.course?._id).filter(Boolean)
      
      const available = allCourses.filter(
        (course: any) => !enrolledIds.includes(course._id) && !pendingIds.includes(course._id) && !rejectedIds.includes(course._id)
      )
      
      setAvailableCourses(available)
    } catch (err: any) {
      console.error("Failed to fetch courses:", err)
      setError(err.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId)
      await enrollmentAPI.enrollCourse(courseId)
      // Refresh all data
      await fetchAllData()
      setEnrolling(null)
    } catch (err: any) {
      setError(err.message)
      setEnrolling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-4 mb-2">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Available Courses</h1>
        </div>
        <p className="text-gray-600 ml-12">Browse and enroll in courses</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {availableCourses.length === 0 && !loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg font-medium text-gray-700 mb-2">No Available Courses</p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              You have either enrolled in all available courses or they are pending approval. 
              Check back later for new courses!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCourses.map((course) => {
            return (
              <Card key={course._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.courseName}</CardTitle>
                  <CardDescription>{course.courseCode}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {course.description && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Description</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{course.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Faculty</p>
                    <p className="font-medium">{course.faculty?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{course.faculty?.email}</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrolling === course._id}
                    variant="default"
                    className="w-full"
                  >
                    {enrolling === course._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
