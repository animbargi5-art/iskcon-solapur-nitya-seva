import { Navigate } from "react-router-dom"
import { auth } from "../services/firebase"

function ProtectedRoute({ children }) {
  if (!auth.currentUser) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
