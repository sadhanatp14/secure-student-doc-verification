"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI, logout } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, User, Mail, Users, ArrowRight, Loader2, LogOut } from "lucide-react"
import Link from "next/link"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [pendingCourses, setPendingCourses] = useState<any[]>([])
  const [rejectedCourses, setRejectedCourses] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all courses first
      const all = await enrollmentAPI.getAllCourses()
      setAllCourses(all)
      
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
        setRejectedCourses(rejected)
      } catch (err) {
        console.log("No rejected courses found")
      }
      
      // Extract pending course IDs
      const pendingCourseIds = pending.map(p => p.course?._id).filter(Boolean)

      // Extract enrolled course IDs
      const enrolledCourseIds = enrolled.map(c => c._id)

      // Extract rejected course IDs
      const rejectedCourseIds = rejected.map(r => r.course?._id).filter(Boolean)

      // Filter courses that are not enrolled and not pending and not rejected
      const available = all.filter(
        course => !enrolledCourseIds.includes(course._id) && !pendingCourseIds.includes(course._id) && !rejectedCourseIds.includes(course._id)
      )
      setAvailableCourses(available)
    } catch (err) {
      console.error("Failed to fetch data:", err)
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
      {/* Welcome Section */}
      <div className="animate-slide-in-up">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        <p className="text-muted-foreground">Student Dashboard - Manage your course enrollments</p>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 text-primary" />
              Full Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{user.name}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              Roll Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{user.rollNumber || "N/A"}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold break-all">{user.email}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Summary */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Courses List
            </CardTitle>
            <CardDescription>Total: {availableCourses.length} course(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/courses">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Approval Pending
              </CardTitle>
              <CardDescription>Courses awaiting faculty approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/pending-courses">
                <Button variant="outline" className="w-full">
                  View Pending Courses <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-destructive" />
                Rejected Requests
              </CardTitle>
              <CardDescription>Enrollments rejected by faculty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/student/rejected-courses">
                <Button variant="outline" className="w-full">
                  View Rejected Courses <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>My Enrolled Courses</CardTitle>
          <CardDescription>Courses you are currently enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.slice(0, 5).map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{course.courseName}</h3>
                      <p className="text-sm text-muted-foreground">Code: {course.courseCode}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Faculty: {course.faculty?.name}
                      </p>
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      Enrolled
                    </div>
                  </div>
                </div>
              ))}
              {enrolledCourses.length > 5 && (
                <Link href="/student-profile">
                  <Button variant="link" className="w-full">
                    View all {enrolledCourses.length} courses →
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
              <Link href="/courses">
                <Button>Browse Available Courses</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
