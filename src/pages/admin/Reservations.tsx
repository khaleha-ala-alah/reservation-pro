import { useMemo, useState, useEffect } from "react";
import { useReservationsStore } from "../../store/reservations";
import { useAuthStore } from "../../store/auth";

export default function Reservations() {
  const { user } = useAuthStore(); // keep store active & read role

  const reservations = useReservationsStore((s) => s.reservations);
  const approve = useReservationsStore((s) => s.approve);
  const reject = useReservationsStore((s) => s.reject);
  const clearAll = useReservationsStore((s) => s.clearAll);

  const pending = useMemo(
    () => reservations.filter((r) => r.status === "pending"),
    [reservations]
  );
  const allSorted = useMemo(
    () =>
      [...reservations].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ),
    [reservations]
  );

  // UI state for confirm modal + toast
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const isAdmin = user?.role === "admin";
  const total = allSorted.length;

  return (
    <div className="p-6 space-y-6">
      {/* Section: Pending with actions */}
      <div className="card card-pad">
        <h1 className="text-xl font-semibold mb-2">Demandes en attente</h1>
        {pending.length === 0 ? (
          <div className="text-slate-500">Aucune demande en attente.</div>
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">
                    {new Date(r.start).toLocaleString()} →{" "}
                    {new Date(r.end).toLocaleString()}
                  </div>
                  <div className="text-slate-500">
                    Équipement : {r.equipmentId} • Utilisateur : {r.userId}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => approve(r.id)}
                  >
                    Approuver
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => reject(r.id)}
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section: All reservations (read-only view) */}
      <div className="card card-pad">
        {/* Header with Clear button (admin only) */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Toutes les réservations</h2>

          {isAdmin && (
            <button
              disabled={total === 0}
              onClick={() => setConfirmOpen(true)}
              className={
                "inline-flex items-center rounded-lg px-3 py-1 text-sm shadow-sm transition " +
                (total === 0
                  ? "bg-red-300 text-white cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white")
              }
              title="annuler  toutes les réservations"
            >
              annuler toutes les réservations
            </button>
          )}
        </div>

        {allSorted.length === 0 ? (
          <div className="text-slate-500">Aucune réservation.</div>
        ) : (
          <ul className="space-y-2">
            {allSorted.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">
                    {new Date(r.start).toLocaleString()} →{" "}
                    {new Date(r.end).toLocaleString()}
                  </div>
                  <div className="text-slate-500">
                    Équipement : {r.equipmentId} • Utilisateur : {r.userId}
                  </div>
                </div>
                <span className="text-sm px-2 py-1 rounded border">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Toast (top center, same animation class you already have) */}
      {toast && (
        <div
          className={
            "fixed left-1/2 top-24 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white text-center animate-toast " +
            (toast.kind === "success" ? "bg-green-600" : "bg-red-600")
          }
        >
          {toast.text}
        </div>
      )}

      {/* 🪟 Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-md shadow-xl animate-fade">
              <h3 className="text-xl font-semibold text-center">
                Supprimer toutes les réservations ?
              </h3>
              <p className="text-gray-600 text-center mt-2">
                Cette action est définitive et supprimera{" "}
                <span className="font-semibold">{total}</span>{" "}
                réservation{total > 1 ? "s" : ""} (en attente, approuvées, refusées, annulées).
                Voulez-vous continuer ?
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmOpen(false)}
                >
                  Annuler
                </button>
                <button
                  className="inline-flex items-center rounded-lg px-4 py-2 shadow-sm bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    clearAll();
                    setConfirmOpen(false);
                    setToast({ text: "Toutes les réservations ont été supprimées.", kind: "success" });
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
