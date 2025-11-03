import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "../store/auth";
import { useReservationsStore } from "../store/reservations";
import logo from "../assets/logo-mark.svg";

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const all = useReservationsStore((s) => s.reservations);
  const now = Date.now();

  
  const isAdmin =
    user?.role === "admin" ||
    user?.name?.toLowerCase() === "admin" ||
    user?.email?.includes("admin");

  
  const stats = useMemo(() => {
    const source = isAdmin ? all : all.filter((r) => r.userId === user?.id);
    const active = source.filter(
      (r) =>
        r.status === "approved" &&
        new Date(r.start).getTime() <= now &&
        new Date(r.end).getTime() > now
    ).length;
    const pending = source.filter((r) => r.status === "pending").length;
    const total = source.length;
    return { active, pending, total };
  }, [all, user, now, isAdmin]);

  
  const nextReservation = useMemo(() => {
    const source = isAdmin ? all : all.filter((r) => r.userId === user?.id);
    return (
      source
        .filter(
          (r) =>
            r.status !== "cancelled" &&
            new Date(r.start).getTime() >= now
        )
        .sort(
          (a, b) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        )[0] || null
    );
  }, [all, user, now, isAdmin]);

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue,{" "}
              <span className="text-blue-600">{user?.name || "Utilisateur"}</span>
            </h1>
            <p className="text-gray-600">
              Tableau de bord de votre compte
            </p>
          </div>
        </div>
        <Link to="/equipment" className="btn btn-primary">
          + Nouvelle réservation
        </Link>
      </div>

      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card card-pad">
          <div className="text-gray-500">Réservations actives</div>
          <div className="text-3xl font-semibold">{stats.active}</div>
        </div>
        <div className="card card-pad">
          <div className="text-gray-500">Demandes en attente</div>
          <div className="text-3xl font-semibold text-amber-500">{stats.pending}</div>
        </div>
        <div className="card card-pad">
          <div className="text-gray-500">Total des réservations</div>
          <div className="text-3xl font-semibold">{stats.total}</div>
        </div>
      </div>

      
      <div className="card card-pad bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="font-semibold mb-1">Prochaine réservation</div>
        {nextReservation ? (
          <div className="text-white/90">
            Équipement :{" "}
            <span className="font-medium">{nextReservation.equipmentId}</span>
            <br />
            {fmt(nextReservation.start)} → {fmt(nextReservation.end)}
            <br />
            Statut : {nextReservation.status}
          </div>
        ) : (
          <div className="text-white/80">
            Aucune réservation à venir.
          </div>
        )}
      </div>

     
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/equipment" className="card card-pad hover:shadow">
          <div className="font-semibold">Explorer les équipements</div>
          <div className="text-gray-600">
            Consultez la liste des équipements disponibles pour la réservation.
          </div>
        </Link>
        <Link to="/reservations" className="card card-pad hover:shadow">
          <div className="font-semibold">Mes réservations</div>
          <div className="text-gray-600">
            Gérez vos réservations actuelles et passées facilement.
          </div>
        </Link>
        <Link to="/admin/reservations" className="card card-pad hover:shadow">
          <div className="font-semibold">Espace administrateur</div>
          <div className="text-gray-600">
            Approuvez ou refusez les réservations en attente.
          </div>
        </Link>
      </div>
    </div>
  );
}
