"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4 animate-slide-in-up">
      <Card className="w-full max-w-md shadow-lg border-0 text-center">
        <div className="pt-12 pb-8 px-6">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-destructive/10 rounded-full flex items-center justify-center">
              <Lock className="w-12 h-12 text-destructive" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page. This action is restricted to specific user roles.
          </p>

          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 text-left space-y-2">
            <p className="text-sm">
              <strong>Security Policy:</strong> Role-Based Access Control (RBAC) is enforced
            </p>
            <p className="text-sm text-muted-foreground">
              Your current role does not have the required permissions for this operation.
            </p>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              Contact your administrator if you believe this is an error.
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
