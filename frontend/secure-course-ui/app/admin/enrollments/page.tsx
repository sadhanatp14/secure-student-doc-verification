"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { adminAPI, enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"

export default function AdminEnrollmentsPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        const [coursesRes, enrollmentsRes] = await Promise.all([
          enrollmentAPI.getAllCourses(),
          adminAPI.getAllApprovedEnrollments()
        ])
        setCourses(coursesRes || [])
        setEnrollments(enrollmentsRes || [])
      } catch (err: any) {
        setError(err.message || "Failed to load enrollments")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const facultyOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string }>()
    courses.forEach((course: any) => {
      if (course.faculty?._id) {
        map.set(course.faculty._id, {
          id: course.faculty._id,
          name: course.faculty.name,
          email: course.faculty.email
        })
      }
    })
    return Array.from(map.values())
  }, [courses])

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment: any) => {
      const courseMatch =
        selectedCourse === "all" || enrollment.course?._id === selectedCourse
      const facultyMatch =
        selectedFaculty === "all" || enrollment.course?.faculty?._id === selectedFaculty
      return courseMatch && facultyMatch
    })
  }, [enrollments, selectedCourse, selectedFaculty])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Remove this student from the course?")
    if (!confirm) return
    try {
      setLoading(true)
      await adminAPI.deleteEnrollment(id)
      setEnrollments((prev) => prev.filter((enr: any) => enr._id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete enrollment")
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
          <h1 className="text-2xl font-bold">Enrollments Overview</h1>
          <p className="text-muted-foreground text-sm">Filter approved enrollments by course and faculty</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select course and faculty to narrow results</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Faculty</label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="All faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All faculty</SelectItem>
                {facultyOptions.map((fac) => (
                  <SelectItem key={fac.id} value={fac.id}>
                    {fac.name} ({fac.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Showing {filteredEnrollments.length} record{filteredEnrollments.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEnrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">No enrollments found for the selected filters.</p>
            )}
            {filteredEnrollments.map((enrollment: any) => (
              <div
                key={enrollment._id}
                className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{enrollment.student?.name}</span>
                    {enrollment.student?.rollNumber && (
                      <Badge variant="secondary">{enrollment.student.rollNumber}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{enrollment.student?.email}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="font-medium">{enrollment.course?.courseName}</div>
                  <div className="text-sm text-muted-foreground">
                    {enrollment.course?.courseCode} · {enrollment.course?.faculty?.name}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(enrollment._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
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
