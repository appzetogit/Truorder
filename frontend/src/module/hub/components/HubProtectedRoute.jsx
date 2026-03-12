import { Navigate, useLocation } from "react-router-dom";
import { getModuleToken, decodeToken } from "@/lib/utils/auth";

export default function HubProtectedRoute({ children }) {
  const location = useLocation();

  const token = getModuleToken("hub");
  if (!token) {
    return <Navigate to="/hub/login" state={{ from: location.pathname }} replace />;
  }

  const decoded = decodeToken(token);
  const hubRole = decoded?.hubRole;

  // Only allow hub_manager into /hub
  if (hubRole !== "hub_manager") {
    return <Navigate to="/hub/login" replace />;
  }

  return children;
}

