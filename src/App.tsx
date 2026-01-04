import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "./store/auth";

// Layout
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyReservations from "./pages/MyReservations";
import EquipmentList from "./pages/equipment/EquipmentList";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import Profile from "./pages/Profile";

// Admin pages
import AdminReservations from "./pages/admin/Reservations";
import EquipmentsQuantity from "./pages/admin/EquipmentsQuantity";
import AdminUsers from "./pages/admin/Users"; // ✅ NEW
import AuditLogs from "./pages/admin/AuditLogs"; // ✅ NEW

// ---------------------
//  Protection Logic
// ---------------------
function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated, token, user } = useAuthStore();
  const ok = Boolean(isAuthenticated && token && user);
  return ok ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const { isAuthenticated, token, user } = useAuthStore();
  const ok = Boolean(isAuthenticated && token && user);
  return ok ? <Navigate to="/dashboard" replace /> : children;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { isAuthenticated, token, user } = useAuthStore();
  const ok = Boolean(isAuthenticated && token && user);
  if (!ok) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

// ---------------------
//  App Component
// ---------------------
export default function App() {
  const { isAuthenticated, token, user } = useAuthStore();
  const ok = Boolean(isAuthenticated && token && user);

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={ok ? "/dashboard" : "/login"} replace />}
        />

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />

        {/* ---------------- PROTECTED ROUTES ---------------- */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Layout>
                <Dashboard />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Layout>
                <Profile />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/reservations"
          element={
            <Protected>
              <Layout>
                <MyReservations />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/equipment"
          element={
            <Protected>
              <Layout>
                <EquipmentList />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/equipment/:id"
          element={
            <Protected>
              <Layout>
                <EquipmentDetail />
              </Layout>
            </Protected>
          }
        />

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          path="/admin/reservations"
          element={
            <AdminOnly>
              <Layout>
                <AdminReservations />
              </Layout>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/equipment-quantity"
          element={
            <AdminOnly>
              <Layout>
                <EquipmentsQuantity />
              </Layout>
            </AdminOnly>
          }
        />

        {/* ✅ NEW: Admin Users (US5) */}
        <Route
          path="/admin/users"
          element={
            <AdminOnly>
              <Layout>
                <AdminUsers />
              </Layout>
            </AdminOnly>
          }
        />

        {/* ✅ NEW: Audit Logs */}
        <Route
          path="/admin/audit-logs"
          element={
            <AdminOnly>
              <Layout>
                <AuditLogs />
              </Layout>
            </AdminOnly>
          }
        />

        {/* ---------------- FALLBACK ---------------- */}
        <Route
          path="*"
          element={<Navigate to={ok ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}