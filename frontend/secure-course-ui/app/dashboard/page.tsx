"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Shield, Lock, ArrowRight, Activity } from "lucide-react"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUserName(localStorage.getItem("userName") || localStorage.getItem("userEmail")?.split("@")[0] || "User")
  }, [])

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="animate-slide-in-up">
        <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
        <p className="text-muted-foreground">Manage your courses securely with encryption and digital verification</p>
        
        {/* Security Status Banner */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Protected Access Enabled</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">All your course data is encrypted and digitally signed. Role-based access control enforced.</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole}</div>
            <p className="text-xs text-muted-foreground mt-1">Access level</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Encrypted</div>
            <p className="text-xs text-muted-foreground mt-1">+ Digitally Signed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        {(userRole === "faculty" || userRole === "admin") && (
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Create New Course
              </CardTitle>
              <CardDescription>Add a new course to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Course <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-medium">Course enrollment verified</p>
                <p className="text-sm text-muted-foreground">Data security: Encrypted & Signed</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-medium">Account security check passed</p>
                <p className="text-sm text-muted-foreground">All credentials verified</p>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New course access granted</p>
                <p className="text-sm text-muted-foreground">Role-based access control</p>
              </div>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
