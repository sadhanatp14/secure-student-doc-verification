"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { enrollmentAPI, courseAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [facultyFilter, setFacultyFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await enrollmentAPI.getAllCourses()
        setCourses(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to load courses")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const query = facultyFilter.trim().toLowerCase()
    if (!query) return courses
    return courses.filter((course: any) => {
      const name = course.faculty?.name?.toLowerCase() || ""
      const email = course.faculty?.email?.toLowerCase() || ""
      return name.includes(query) || email.includes(query)
    })
  }, [courses, facultyFilter])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Delete this course? This will remove it for all students and faculty.")
    if (!confirm) return
    try {
      setLoading(true)
      await courseAPI.deleteCourse(id)
      setCourses((prev) => prev.filter((c: any) => c._id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete course")
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
          <h1 className="text-2xl font-bold">Course Explorer</h1>
          <p className="text-muted-foreground text-sm">Filter courses by faculty and delete if needed</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filter by Faculty</CardTitle>
          <CardDescription>Type a faculty name or email to narrow courses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Faculty Name/Email</label>
            <Input
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              placeholder="e.g. Dr. Smith or smith@univ.edu"
            />
          </div>
        </CardContent>
      </Card>

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
            <CardTitle>Courses</CardTitle>
            <CardDescription>Showing {filtered.length} course{filtered.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses found for this faculty filter.</p>
            )}
            {filtered.map((course: any) => (
              <div
                key={course._id}
                className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{course.courseName}</span>
                    <Badge variant="secondary">{course.courseCode}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Faculty: {course.faculty?.name} ({course.faculty?.email})
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(course._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
