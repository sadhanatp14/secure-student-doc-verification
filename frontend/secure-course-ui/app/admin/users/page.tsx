"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Trash2, Users, BookOpen } from "lucide-react"

export default function AdminUsersPage() {
  const [students, setStudents] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const [studentsRes, facultyRes] = await Promise.all([
          adminAPI.getAllStudents(),
          adminAPI.getAllFaculty()
        ])
        setStudents(studentsRes || [])
        setFaculty(facultyRes || [])
      } catch (err: any) {
        setError(err.message || "Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (id: string, name: string, role: string) => {
    const confirm = window.confirm(`Delete ${name} (${role})? This action cannot be undone.`)
    if (!confirm) return
    try {
      setLoading(true)
      await adminAPI.deleteUser(id)
      if (role === "student") {
        setStudents((prev) => prev.filter((s: any) => s._id !== id))
      } else {
        setFaculty((prev) => prev.filter((f: any) => f._id !== id))
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="group inline-flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground group-hover:text-blue-600"
            aria-label="Back to Admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">View and manage all students and faculty accounts</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Students: {students.length} | Faculty: {faculty.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Students ({students.length})
                </TabsTrigger>
                <TabsTrigger value="faculty" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Faculty ({faculty.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="space-y-3 mt-4">
                {students.length === 0 && (
                  <p className="text-sm text-muted-foreground">No students found.</p>
                )}
                {students.map((student: any) => (
                  <div
                    key={student._id}
                    className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{student.name}</span>
                        {student.rollNumber && (
                          <Badge variant="secondary">{student.rollNumber}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                      {student.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(student._id, student.name, "student")}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="faculty" className="space-y-3 mt-4">
                {faculty.length === 0 && (
                  <p className="text-sm text-muted-foreground">No faculty found.</p>
                )}
                {faculty.map((fac: any) => (
                  <div
                    key={fac._id}
                    className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{fac.name}</span>
                        {fac.rollNumber && (
                          <Badge variant="secondary">{fac.rollNumber}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{fac.email}</div>
                      {fac.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(fac._id, fac.name, "faculty")}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
