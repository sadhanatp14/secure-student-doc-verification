"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Ban } from "lucide-react"

export default function RejectedCoursesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [rejected, setRejected] = useState<any[]>([])
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
      const rejectedEnrollments = await enrollmentAPI.getMyRejectedEnrollments()
      setRejected(rejectedEnrollments)
    } catch (err) {
      console.error("Failed to fetch rejected enrollments:", err)
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Rejected Courses</h1>
          <p className="text-muted-foreground">Enrollments rejected by faculty</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : rejected.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Ban className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No rejected enrollments</p>
            <p className="text-sm text-muted-foreground">Enroll in courses to see updates here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rejected.map((enrollment) => (
            <Card key={enrollment._id} className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {enrollment.course?.courseName || "Course"}
                </CardTitle>
                <CardDescription>Code: {enrollment.course?.courseCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Faculty: {enrollment.course?.faculty?.name || "N/A"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reason:</span> {enrollment.rejectionReason || "Not provided"}
                </div>
                <div className="text-xs text-muted-foreground">Updated: {new Date(enrollment.updatedAt).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
