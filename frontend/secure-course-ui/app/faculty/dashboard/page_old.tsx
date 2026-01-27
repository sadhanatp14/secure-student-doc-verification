"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { courseAPI, logout } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, User, Mail, Plus, ArrowRight, Loader2, LogOut, CheckCircle, Eye, Edit } from "lucide-react"
import Link from "next/link"

export default function FacultyDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    setLoading(false)
  }, [router])

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
        <p className="text-muted-foreground">Faculty Dashboard - Manage your courses</p>
      </div>

      {/* Faculty Info Cards */}
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
              <Mail className="w-4 h-4 text-primary" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold break-all">{user.email}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">{user.role}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Course
            </CardTitle>
            <CardDescription>Add a new course with encryption and digital signature</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create-course">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Create Course <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Manage Courses
            </CardTitle>
            <CardDescription>View and edit your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faculty/manage-courses">
              <Button variant="outline" className="w-full">
                Manage Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Accept Enrollments
            </CardTitle>
            <CardDescription>Review and approve pending enrollment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faculty/pending-approvals">
              <Button variant="outline" className="w-full">
                Review Requests <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              View Enrollments
            </CardTitle>
            <CardDescription>See students enrolled in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faculty/view-enrollments">
              <Button variant="outline" className="w-full">
                View Enrollments <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Faculty Privileges</CardTitle>
          <CardDescription>What you can do as a faculty member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Create Courses</h4>
                <p className="text-sm text-muted-foreground">
                  Create new courses with encrypted descriptions and digital signatures
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Edit className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Manage Courses</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage courses you've created with full access to encrypted data. Can edit course details and stuff after created
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Accept Enrollments</h4>
                <p className="text-sm text-muted-foreground">
                  Accept or reject students based on their enrollment and the pending requests for courses approval. This accept or reject will be reflected back to the student
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">View Enrollments</h4>
                <p className="text-sm text-muted-foreground">
                  See which students have enrolled in your courses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
