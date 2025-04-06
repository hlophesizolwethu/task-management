"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRole: "admin" | "member" | "both"
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
      } else if (allowedRole !== "both" && userRole !== allowedRole) {
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (userRole === "member") {
          router.push("/member/dashboard")
        } else {
          router.push("/")
        }
      }
    }
  }, [user, userRole, loading, router, allowedRole])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user || (allowedRole !== "both" && userRole !== allowedRole)) {
    return null
  }

  return <>{children}</>
}

