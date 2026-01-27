"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Mail, Shield, AlertTriangle, Check } from "lucide-react"

interface GeneratedInvite {
  id: string
  email: string
  role: "faculty" | "student"
  token: string
  createdAt: Date
  expiresAt: Date
  status: "unused" | "used" | "expired"
}

export default function AdminInvitesPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"faculty" | "student">("faculty")
  const [loading, setLoading] = useState(false)
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>([])
  const [copiedId, setCopiedId] = useState<string>("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role || "")

    // Redirect if not admin
    if (role !== "admin") {
      router.push("/unauthorized")
      return
    }

    // Load existing invites from localStorage
    const saved = localStorage.getItem("generatedInvites")
    if (saved) {
      setGeneratedInvites(JSON.parse(saved))
    }
  }, [router])

  const generateToken = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `invite_${inviteRole}_${timestamp}_${random}`
  }

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      if (!inviteEmail) {
        setMessage("Please enter an email address")
        return
      }

      if (!inviteEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setMessage("Please enter a valid email address")
        return
      }

      const token = generateToken()
      const newInvite: GeneratedInvite = {
        id: Math.random().toString(36).substring(7),
        email: inviteEmail,
        role: inviteRole,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "unused",
      }

      const updated = [newInvite, ...generatedInvites]
      setGeneratedInvites(updated)
      localStorage.setItem("generatedInvites", JSON.stringify(updated))

      setMessage(`Invitation generated successfully for ${inviteRole}`)
      setInviteEmail("")

      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("Failed to generate invitation")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(""), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
      case "expired":
        return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      case "unused":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
      default:
        return "bg-secondary"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      case "expired":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      case "unused":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (userRole !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Admin Invite Management
        </h1>
        <p className="text-muted-foreground mt-2">Generate and manage invitation tokens for faculty and student accounts</p>
      </div>

      {/* Warning Alert */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
        <CardContent className="pt-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Sensitive Operation</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              Tokens grant privileged access to the system. Share them securely and never commit them to version control.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generate Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Invitation Token</CardTitle>
          <CardDescription>Create an invitation for a new faculty or student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            {message && (
              <div
                className={`px-4 py-3 rounded-lg text-sm flex gap-2 ${
                  message.includes("successfully")
                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Invitee Email
                </label>
                <Input
                  type="email"
                  placeholder="faculty@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-background border border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "faculty" | "student")}
                  className="w-full bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Generating..." : "Generate Invitation Token"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Invites List */}
      {generatedInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issued Invitations</CardTitle>
            <CardDescription>Track and manage generated invitation tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedInvites.map((invite) => (
                <div key={invite.id} className={`p-4 rounded-lg border ${getStatusColor(invite.status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{invite.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {invite.createdAt.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {invite.expiresAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadgeColor(invite.status)}`}>
                        {invite.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${inviteRole === "admin" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"}`}>
                        {invite.role}
                      </span>
                    </div>
                  </div>

                  <div className="bg-background/50 p-3 rounded border border-border/50 mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Invitation Token:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono flex-1 break-all">{invite.token}</code>
                      <button
                        onClick={() => copyToClipboard(invite.token, invite.id)}
                        className="p-2 hover:bg-secondary rounded transition-colors flex-shrink-0"
                      >
                        {copiedId === invite.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Share this token securely with {invite.email}. It expires in 7 days.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedInvites.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Invitations Generated</h3>
            <p className="text-muted-foreground text-sm">
              Generate your first invitation token using the form above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
