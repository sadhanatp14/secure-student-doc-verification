"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, User, BookOpen, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ViewEnrollmentsPage() {
  const router = useRouter()
  const [allEnrollments, setAllEnrollments] = useState<any[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([])
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
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
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [approvedEnrollments, allCourses] = await Promise.all([
        enrollmentAPI.getApprovedEnrollments(),
        enrollmentAPI.getAllCourses()
      ])

      console.log("Approved Enrollments:", approvedEnrollments)
      console.log("All Courses:", allCourses)

      setAllEnrollments(approvedEnrollments)
      setFilteredEnrollments(approvedEnrollments)

      // Get faculty's courses
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const facultyCourses = allCourses.filter((course: any) => course.faculty?._id === userData.id)
        console.log("Faculty Courses:", facultyCourses)
        console.log("User Data:", userData)

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
      setFilteredEnrollments(allEnrollments)
    } else {
      const filtered = allEnrollments.filter(
        (enrollment: any) => enrollment.course._id === courseId
      )
      setFilteredEnrollments(filtered)
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
          <h1 className="text-3xl font-bold">View Enrollments</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          Students enrolled in your courses - {filteredEnrollments.length} student(s)
        </p>
      </div>

      {/* Course Filter */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filter by Course</CardTitle>
          <CardDescription>Select a course to view enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={handleCourseFilter}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {myCourses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Course Cards with Enrollments */}
      <div className="space-y-6">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : myCourses.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No courses created yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first course to see enrollments</p>
              <Link href="/dashboard/create-course">
                <Button>Create Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          myCourses
            .filter(course => selectedCourse === "all" || course._id === selectedCourse)
            .map((course) => {
              const courseEnrollments = filteredEnrollments.filter(
                (enrollment: any) => enrollment.course._id === course._id
              )
              
              return (
                <Card key={course._id} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {course.courseCode} - {course.courseName}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{courseEnrollments.length} student(s) enrolled</span>
                    </div>
                    {courseEnrollments.length > 0 ? (
                      <div className="space-y-3">
                        {courseEnrollments.map((enrollment: any) => (
                          <div
                            key={enrollment._id}
                            className="border rounded-lg p-4 hover:bg-accent transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <h4 className="font-semibold">{enrollment.student.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Roll: {enrollment.student.rollNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Email: {enrollment.student.email}
                                </p>
                              </div>
                              <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                                Approved
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Enrolled on: {new Date(enrollment.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                    )}
                  </CardContent>
                </Card>
              )
            })
        )}
      </div>
    </div>
  )
}
