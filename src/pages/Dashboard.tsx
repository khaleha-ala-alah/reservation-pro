import { Link } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useReservationsStore } from "../store/reservations";
import logo from "../assets/logo-mark.svg";

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

function getId(v: any) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v._id || v.id || "";
}

function getName(v: any) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.name || "";
}

export default function Dashboard() {
  const { user } = useAuthStore();

  const all = useReservationsStore((s) => s.reservations);

  // ✅ IMPORTANT: fetch data on dashboard load
  const fetchMine = useReservationsStore((s) => (s as any).fetchMine || s.fetch);
  const fetchAdmin = useReservationsStore((s) => (s as any).fetchAdmin);

  const now = Date.now();

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "supervisor" ||
    user?.name?.toLowerCase() === "admin" ||
    user?.email?.includes("admin");

  // ✅ load reservations depending on role
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        if (isAdmin && typeof fetchAdmin === "function") {
          await fetchAdmin();
        } else if (typeof fetchMine === "function") {
          await fetchMine();
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, isAdmin, fetchAdmin, fetchMine]);

  // ✅ normalize source list
  const source = useMemo(() => {
    if (isAdmin) return all || [];
    const myId = user?.id || user?._id;
    return (all || []).filter((r: any) => String(getId(r.userId)) === String(myId));
  }, [all, isAdmin, user]);

  const stats = useMemo(() => {
    const active = source.filter(
      (r: any) =>
        r.status === "approved" &&
        new Date(r.start).getTime() <= now &&
        new Date(r.end).getTime() > now
    ).length;

    const pending = source.filter((r: any) => r.status === "pending").length;
    const total = source.length;

    return { active, pending, total };
  }, [source, now]);

  const nextReservation = useMemo(() => {
    return (
      source
        .filter(
          (r: any) =>
            r.status !== "cancelled" && new Date(r.start).getTime() >= now
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        )[0] || null
    );
  }, [source, now]);

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
            <p className="text-gray-600">Tableau de bord de votre compte</p>
          </div>
        </div>

        <Link to="/equipment" className="btn btn-primary">
          + Nouvelle réservation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card card-pad">
          <div className="text-gray-500">Réservations actives</div>
          <div className="text-3xl font-semibold">{stats.active}</div>
        </div>
        <div className="card card-pad">
          <div className="text-gray-500">Demandes en attente</div>
          <div className="text-3xl font-semibold text-amber-500">
            {stats.pending}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-gray-500">Total des réservations</div>
          <div className="text-3xl font-semibold">{stats.total}</div>
        </div>
      </div>

      {/* Next reservation */}
      <div className="card card-pad bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="font-semibold mb-1">Prochaine réservation</div>
        {nextReservation ? (
          <div className="text-white/90">
            Équipement :{" "}
            <span className="font-medium">
              {getName(nextReservation.equipmentId) ||
                getId(nextReservation.equipmentId) ||
                "—"}
            </span>
            <br />
            {fmt(nextReservation.start)} → {fmt(nextReservation.end)}
            <br />
            Statut : {nextReservation.status}
          </div>
        ) : (
          <div className="text-white/80">Aucune réservation à venir.</div>
        )}
      </div>

      {/* Shortcuts */}
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

        {isAdmin && (
          <Link to="/admin/reservations" className="card card-pad hover:shadow">
            <div className="font-semibold">Espace administrateur</div>
            <div className="text-gray-600">
              Approuvez ou refusez les réservations en attente.
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
