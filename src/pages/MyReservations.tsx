
import { useMemo } from "react";
import { useReservationsStore } from "../store/reservations";
import { useAuthStore } from "../store/auth";

export default function MyReservations() {
  const { user } = useAuthStore();
  const allReservations = useReservationsStore((s) => s.reservations) || [];
  const cancelReservation = useReservationsStore((s) => s.cancel);

  const items = useMemo(() => {
    if (!user) return [];
    return allReservations
      .filter((r) => r.userId === user.id)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [allReservations, user]);

  return (
    <div className="space-y-4 animate-fade">
      <h1 className="text-2xl font-semibold">Mes réservations</h1>

      {items.length === 0 ? (
        <div className="text-gray-600">Aucune réservation pour l’instant.</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="card card-pad flex items-center justify-between">
              <div>
                <div className="font-medium">{r.equipmentId}</div>
                <div>
                  {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                </div>
                <div className="text-gray-500">Statut: {r.status}</div>
                {r.reason && <div className="text-gray-600">Motif: {r.reason}</div>}
              </div>
              {r.status !== "cancelled" && (
                <button className="btn btn-secondary" onClick={() => cancelReservation(r.id)}>
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
