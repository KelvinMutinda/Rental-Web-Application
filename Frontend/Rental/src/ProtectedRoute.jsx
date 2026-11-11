// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Reads the role and expiry from the JWT your login already issues.
// This only decides which page to show. The backend still checks the
// token on every request, so this is not what keeps the data safe.
function readToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token"); // expired
      return null;
    }
    return payload; // { id, role, exp, ... }
  } catch {
    localStorage.removeItem("token"); // malformed
    return null;
  }
}

/*
  <ProtectedRoute role="admin">   only admins
  <ProtectedRoute role="tenant">  only non-admin users (tenants)
*/
function ProtectedRoute({
  role,
  children,
  loginPath = "/login",
  adminPath = "/AdminDashboard",
  tenantPath = "/TenantDashboard",
}) {
  const location = useLocation();
  const session = readToken();

  // Not logged in (or token expired): go to login, remember where they wanted to go
  if (!session) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  const isAdmin = session.role === "admin";

  // Logged in but on the wrong page: send them to their own dashboard
  if (role === "admin" && !isAdmin) {
    return <Navigate to={tenantPath} replace />;
  }
  if (role === "tenant" && isAdmin) {
    return <Navigate to={adminPath} replace />;
  }

  return children;
}

export default ProtectedRoute;