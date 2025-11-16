import React, { useEffect, useMemo, useState } from "react";
import { useReservationsStore } from "../../store/reservations";
import { useAuthStore } from "../../store/auth";

type Reservation = {
  _id: string;
  equipmentId: string;
  userId: string;
  start: string;
  end: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

export default function AdminReservations() {
  const { user } = useAuthStore(); // to keep role in memory if you show it
  const [rows, setRows] = useState<Reservation[]>([]);

  const fetchAdmin = useReservationsStore((s) => s.fetchAdmin);
  const approve = useReservationsStore((s) => s.approve);
  const reject = useReservationsStore((s) => s.reject);

  useEffect(() => {
    (async () => {
      const data = await fetchAdmin("pending"); // only pending for now
      setRows(data || []);
    })();
  }, [fetchAdmin]);

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);

  const handleApprove = async (id: string) => {
    const updated = await approve(id);
    setRows((prev) => prev.map((r) => (r._id === id ? (updated as Reservation) : r)));
  };

  const handleReject = async (id: string) => {
    const updated = await reject(id);
    setRows((prev) => prev.map((r) => (r._id === id ? (updated as Reservation) : r)));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Réservations (Admin)</h1>
        <p className="text-gray-600">Valider ou refuser les demandes de réservation.</p>
      </div>

      {pending.length === 0 ? (
        <div className="text-gray-600">Aucune réservation en attente.</div>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r._id} className="rounded-xl border p-4 shadow-sm bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Équipement: {r.equipmentId}</div>
                  <div className="text-sm text-gray-600">Utilisateur: {r.userId}</div>
                  {r.reason && <div className="text-sm mt-1">Motif: {r.reason}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleApprove(r._id)}
                  >
                    Approuver
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleReject(r._id)}
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
