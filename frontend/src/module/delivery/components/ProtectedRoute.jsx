import { Navigate, useLocation } from "react-router-dom"
import { isModuleAuthenticated } from "@/lib/utils/auth"

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const isAuthenticated = isModuleAuthenticated("delivery")

  if (!isAuthenticated) {
    return <Navigate to="/delivery/sign-in" replace />
  }

  const needsSignup = localStorage.getItem("delivery_needsSignup") === "true"
  const isSignupRoute =
    location.pathname.startsWith("/delivery/signup")

  if (needsSignup && !isSignupRoute) {
    return <Navigate to="/delivery/signup/details" replace />
  }

  return children
}

