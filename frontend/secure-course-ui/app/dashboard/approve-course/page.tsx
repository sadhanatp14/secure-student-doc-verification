"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from "lucide-react"

interface PendingCourse {
  id: string
  title: string
  description: string
  instructor: string
  submittedAt: Date
  status: "pending" | "approved" | "rejected"
  students: number
  courseCode: string
}

export default function ApproveCourse() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<PendingCourse | null>(null)
  const [actionMessage, setActionMessage] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role || "")

    if (role !== "admin") {
      router.push("/unauthorized")
      return
    }

    // Mock pending courses
    const mockCourses: PendingCourse[] = [
      {
        id: "1",
        title: "Advanced Data Structures",
        description: "Deep dive into advanced data structures including trees, graphs, and advanced sorting algorithms.",
        instructor: "Dr. John Smith",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "pending",
        students: 45,
        courseCode: "CS301",
      },
      {
        id: "2",
        title: "Machine Learning Fundamentals",
        description: "Introduction to machine learning concepts, algorithms, and real-world applications.",
        instructor: "Prof. Sarah Johnson",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "pending",
        students: 62,
        courseCode: "AI201",
      },
      {
        id: "3",
        title: "Web Development with React",
        description: "Building modern web applications using React, Redux, and other tools.",
        instructor: "Dr. Emily Brown",
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "pending",
        students: 38,
        courseCode: "WEB101",
      },
    ]

    setPendingCourses(mockCourses)
  }, [router])

  const handleApproveCourse = async (courseId: string) => {
    setLoading(true)
    try {
      setPendingCourses(
        pendingCourses.map((course) =>
          course.id === courseId ? { ...course, status: "approved" } : course
        )
      )
      setActionMessage("Course approved successfully!")
      setSelectedCourse(null)
      setTimeout(() => setActionMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectCourse = async (courseId: string) => {
    setLoading(true)
    try {
      setPendingCourses(
        pendingCourses.map((course) =>
          course.id === courseId ? { ...course, status: "rejected" } : course
        )
      )
      setActionMessage("Course rejected successfully!")
      setSelectedCourse(null)
      setTimeout(() => setActionMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  if (userRole !== "admin") {
    return null
  }

  const pendingList = pendingCourses.filter((c) => c.status === "pending")
  const approvedList = pendingCourses.filter((c) => c.status === "approved")
  const rejectedList = pendingCourses.filter((c) => c.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="w-8 h-8 text-primary" />
          Course Approval Management
        </h1>
        <p className="text-muted-foreground mt-2">Review and approve course submissions from faculty members</p>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm flex gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Selected Course Details */}
      {selectedCourse && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedCourse.title}</CardTitle>
                <CardDescription className="mt-2">{selectedCourse.courseCode}</CardDescription>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedCourse.status)}`}>
                {selectedCourse.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Instructor</p>
                <p className="text-sm font-medium flex items-center gap-1 mt-1">
                  <User className="w-4 h-4" /> {selectedCourse.instructor}
                </p>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-sm font-medium mt-1">{selectedCourse.students}</p>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" /> {selectedCourse.submittedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium flex items-center gap-1 mt-1">
                  {getStatusIcon(selectedCourse.status)} {selectedCourse.status}
                </p>
              </div>
            </div>

            {selectedCourse.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleApproveCourse(selectedCourse.id)}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Course
                </Button>
                <Button
                  onClick={() => handleRejectCourse(selectedCourse.id)}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Course
                </Button>
                <Button
                  onClick={() => setSelectedCourse(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}

            {selectedCourse.status !== "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approval ({pendingList.length})
          </CardTitle>
          <CardDescription>Courses waiting for your review</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingList.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No pending courses for approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> {course.instructor}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {course.students} students • {course.courseCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Courses */}
      {approvedList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Approved Courses ({approvedList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedList.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" /> {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.courseCode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Courses */}
      {rejectedList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rejected Courses ({rejectedList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedList.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" /> {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.courseCode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
