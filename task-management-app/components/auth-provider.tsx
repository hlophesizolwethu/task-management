"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
//import { useRouter } from "next/navigation"

type UserRole = "admin" | "member" | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  //const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole)
          } else {
            setUserRole(null)
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, userRole, loading }}>{children}</AuthContext.Provider>
}

