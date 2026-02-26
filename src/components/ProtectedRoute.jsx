// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-white">Loading...</div>
    </div>
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return children
}