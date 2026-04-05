import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>
  }

  if (user) return children

  const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)
  return <Navigate to={`/login?redirect=${redirect}`} replace />
}
