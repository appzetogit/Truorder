import { Navigate, useLocation } from "react-router-dom";
import { decodeToken, getModuleToken } from "@/lib/utils/auth";

export default function HubProtectedRoute({ children }) {
  const location = useLocation();
  const token = getModuleToken("hub");

  if (!token) {
    return <Navigate to="/hub/login" state={{ from: location.pathname }} replace />;
  }

  const decoded = decodeToken(token);
  if (decoded?.hubRole !== "hub_manager") {
    return <Navigate to="/hub/login" replace />;
  }

  return children;
}
