import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Check both isAuthenticated and user to ensure we have complete auth state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}