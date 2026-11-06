import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen"><Spinner /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
