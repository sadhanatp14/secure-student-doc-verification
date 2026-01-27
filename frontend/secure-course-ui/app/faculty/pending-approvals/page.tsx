"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, User } from "lucide-react"
import Link from "next/link"

export default function PendingApprovalsPage() {
  const router = useRouter()
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([])
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
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
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pending, allCourses] = await Promise.all([
        enrollmentAPI.getPendingEnrollments(),
        enrollmentAPI.getAllCourses()
      ])

      // Sort by latest first
      const sortedPending = pending.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setPendingEnrollments(sortedPending)
      setFilteredEnrollments(sortedPending)

      // Get unique courses from pending enrollments
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const facultyCourses = allCourses.filter((course: any) => course.faculty?._id === userData.id)
      setMyCourses(facultyCourses)
    } catch (err) {
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCourseFilter = (courseId: string) => {
    setSelectedCourse(courseId)
    if (courseId === "all") {
      setFilteredEnrollments(pendingEnrollments)
    } else {
      const filtered = pendingEnrollments.filter(
        (enrollment: any) => enrollment.course._id === courseId
      )
      setFilteredEnrollments(filtered)
    }
  }

  const handleApproval = async (enrollmentId: string, status: "approved" | "rejected") => {
    try {
      let reason: string | undefined
      if (status === "rejected") {
        const confirmReject = window.confirm("Are you sure you want to reject this enrollment?")
        if (!confirmReject) return
        const input = window.prompt("Please provide a reason for rejection:") || ""
        if (!input.trim()) {
          alert("Rejection reason is required")
          return
        }
        reason = input.trim()
      }

      setProcessing(enrollmentId)
      await enrollmentAPI.updateEnrollmentStatus(enrollmentId, status, reason)
      await fetchData()
      setProcessing(null)
    } catch (err) {
      console.error("Failed to update enrollment:", err)
      setProcessing(null)
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
          <h1 className="text-3xl font-bold">Pending Approvals</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          Review and approve enrollment requests - {filteredEnrollments.length} pending
        </p>
      </div>

      {/* Course Filter */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filter by Course</CardTitle>
          <CardDescription>Select a course to filter enrollment requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={handleCourseFilter}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses ({pendingEnrollments.length})</SelectItem>
              {myCourses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Pending Enrollments */}
      <div className="space-y-4">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : filteredEnrollments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No pending enrollments</p>
              <p className="text-sm text-muted-foreground">All enrollment requests have been processed</p>
            </CardContent>
          </Card>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <Card key={enrollment._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {enrollment.student.name}
                    </CardTitle>
                    <CardDescription>
                      Roll: {enrollment.student.rollNumber} • {enrollment.student.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Course</p>
                  <p className="font-medium">{enrollment.course.courseCode} - {enrollment.course.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Requested On</p>
                  <p className="text-sm">{new Date(enrollment.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApproval(enrollment._id, "approved")}
                    disabled={processing === enrollment._id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing === enrollment._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleApproval(enrollment._id, "rejected")}
                    disabled={processing === enrollment._id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {processing === enrollment._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
