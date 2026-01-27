"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { adminAPI, logout } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, User, Mail, UserPlus, ArrowRight, Loader2, Copy, CheckCircle, LogOut, Users, BookOpen } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("student")
  const [generatedToken, setGeneratedToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setGeneratedToken("")

    if (!inviteEmail) {
      setError("Please enter an email")
      return
    }

    try {
      setLoading(true)
      const response = await adminAPI.createInvite(inviteEmail, inviteRole)
      setGeneratedToken(response.inviteToken)
      setInviteEmail("")
    } catch (err: any) {
      setError(err.message || "Failed to generate invite token")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <p className="text-muted-foreground">Admin Dashboard - Manage users and system</p>
      </div>

      {/* Admin Info Cards */}
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
              <Shield className="w-4 h-4 text-primary" />
              Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">{user.role}</div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Invite Token */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Generate Invitation Token
          </CardTitle>
          <CardDescription>Create secure invite tokens for new users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Admin users must be registered directly in the database
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Generate Invite Token
                </>
              )}
            </Button>

            {generatedToken && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">Token Generated Successfully!</p>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      Share this token with the user for registration
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Input value={generatedToken} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={copyToClipboard}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Explorers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment Explorer */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Enrollment Explorer</CardTitle>
            <CardDescription>Filter enrolled students by course and faculty</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/enrollments">
              <Button className="w-full">
                View Enrollments <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Course Explorer */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Course Explorer</CardTitle>
            <CardDescription>Filter courses by faculty and manage deletions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/courses">
              <Button className="w-full">
                View Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and delete student and faculty accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/users">
            <Button className="w-full">
              Manage Users <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Admin Privileges */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Admin Capabilities</CardTitle>
          <CardDescription>What you can do as an administrator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Generate Invitation Tokens</h4>
                <p className="text-sm text-muted-foreground">
                  Create secure invitation tokens for new students and faculty (admin accounts must be created directly)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">User Management</h4>
                <p className="text-sm text-muted-foreground">
                  View and delete student and faculty accounts from the system
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Course Management</h4>
                <p className="text-sm text-muted-foreground">
                  View and delete any course from the system, filter by faculty
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Enrollment Oversight</h4>
                <p className="text-sm text-muted-foreground">
                  View all approved enrollments, filter by course and faculty, remove students from courses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Full System Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Access all administrative features and system resources
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
