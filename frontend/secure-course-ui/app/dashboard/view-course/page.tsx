"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Lock } from "lucide-react"

export default function ViewCoursePage() {
  const courseData = {
    code: "CS101",
    name: "Introduction to Computer Science",
    description:
      "A comprehensive introduction to fundamental computer science concepts, including algorithms, data structures, and programming principles.",
    faculty: "Dr. Jane Smith",
    encrypted: true,
    verified: true,
  }

  return (
    <div className="p-8 max-w-3xl animate-slide-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{courseData.name}</h1>
        <p className="text-muted-foreground">Course Code: {courseData.code}</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <span>Course Information</span>
              <div className="flex gap-2">
                {courseData.encrypted && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
                {courseData.verified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Digitally Verified
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Faculty</p>
              <p className="font-medium">{courseData.faculty}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{courseData.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">Integrity Verified</p>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                This course data has been cryptographically verified and has not been tampered with. The digital
                signature confirms authenticity.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Security Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Encryption Standard:</span>
              <span className="font-medium">AES-256</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Digital Signature:</span>
              <span className="font-medium">HMAC-SHA256</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Last Verified:</span>
              <span className="font-medium">Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
