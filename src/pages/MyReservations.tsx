import React, { useEffect, useMemo } from "react";
import { useReservationsStore } from "../store/reservations";
import { useAuthStore } from "../store/auth";

export default function MyReservations() {
  const { user } = useAuthStore();
  const reservations = useReservationsStore((s) => s.reservations);
  const fetchMine = useReservationsStore((s) => s.fetchMine);
  const cancelReservation = useReservationsStore((s) => s.cancel);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const items = useMemo(() => {
    if (!user) return [];
    return (reservations || [])
      .filter((r) => r.userId === user.id)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [reservations, user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Mes réservations</h1>

      {items.length === 0 ? (
        <div className="text-gray-600">Vous n’avez pas encore de réservations.</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r._id} className="rounded-xl border p-4 shadow-sm bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Équipement: {r.equipmentId}</div>
                <div className="text-sm">
                  Statut:{" "}
                  <span
                    className={
                      "px-2 py-1 rounded text-xs " +
                      (r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700")
                    }
                  >
                    {r.status}
                  </span>
                </div>
                {r.reason && <div className="text-gray-600 text-sm mt-1">Motif: {r.reason}</div>}
              </div>

              {r.status !== "cancelled" && (
                <button
                  className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-black"
                  onClick={() => cancelReservation(r._id)}
                >
                  Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
