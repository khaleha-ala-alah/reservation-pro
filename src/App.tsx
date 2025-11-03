import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyReservations from "./pages/MyReservations";
import EquipmentList from "./pages/equipment/EquipmentList";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import AdminReservations from "./pages/admin/Reservations";

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

export default function App() {
  const { isAuthenticated, token, user } = useAuthStore();
  const ok = Boolean(isAuthenticated && token && user);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ FIXED: default route now checks auth properly */}
        <Route
          path="/"
          element={<Navigate to={ok ? "/dashboard" : "/login"} replace />}
        />

        {/* Public routes */}
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

        {/* Protected routes */}
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
        <Route
          path="/admin/reservations"
          element={
            <Protected>
              <Layout>
                <AdminReservations />
              </Layout>
            </Protected>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={ok ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
