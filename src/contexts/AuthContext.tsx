'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentSession, getProfile, signOut as authSignOut } from '@/lib/auth'
import { Trabajador } from '@/types/database'

interface User {
  id: string
  email: string
  user_metadata: {
    full_name: string
    trabajador_id: number
    rut: string
    rol: string
    turno_habitual: string
    empresa: string
  }
}

interface AuthContextType {
  user: User | null
  profile: Trabajador | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Trabajador | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    try {
      setLoading(true)
      const session = await getCurrentSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Get profile data
        if (session.trabajador) {
          setProfile(session.trabajador)
        } else if (session.user.user_metadata?.trabajador_id) {
          const profileData = await getProfile(session.user.user_metadata.trabajador_id.toString())
          setProfile(profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    await checkSession()
  }

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    checkSession()

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase_session') {
        checkSession()
      }
    }

    // Listen for custom events (for same-tab updates)
    const handleSessionUpdate = () => {
      checkSession()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('sessionUpdated', handleSessionUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('sessionUpdated', handleSessionUpdate)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
