import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import logo from "../assets/logo-horizontal.svg"; 

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "supervisor" ||
    user?.name?.toLowerCase() === "admin" ||
    user?.email?.includes("admin");

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-wide text-gray-800">
            Reservation <span className="text-blue-600">Pro</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to={isAdmin ? "/admin/reservations" : "/reservations"}
            className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
          >
            {isAdmin ? "Toutes les réservations" : "Mes réservations"}
          </NavLink>
          {isAdmin && (
  <NavLink
    to="/admin/equipment-quantity"
    className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"
  >
    Quantités
  </NavLink>
)}

          <NavLink
            to="/equipment"
            className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
          >
            Équipements
          </NavLink>

          {/* {isAdmin && (
            <NavLink
              to="/admin/reservations"
              className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
            >
              Admin
            </NavLink>
          )} */}
          <NavLink to="/profile"      className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition">
           Profil
          </NavLink>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="ml-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Déconnexion
          </button>
          
        </nav>
      </div>
    </header>
  );
}
