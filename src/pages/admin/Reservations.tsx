import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationsStore } from "../../store/reservations";
import { useAuthStore } from "../../store/auth";
import { useEquipmentsStore } from "../../store/equipments";
import { api } from "../../api/axios";

type AdminReservation = {
  _id: string;
  equipmentId: any; // يمكن أن يكون string أو object
  userId: any;
  start: string;
  end: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

const STATUS_LABEL: Record<AdminReservation["status"], string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
  cancelled: "Annulée",
};

function statusClass(s: AdminReservation["status"]) {
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function AdminReservations() {
  const nav = useNavigate();
  const { user } = useAuthStore();

  // حماية بسيطة: لو مش أدمن → رجّعه للداشبورد
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "supervisor") {
      nav("/dashboard", { replace: true });
    }
  }, [user, nav]);

  const fetchAdmin = useReservationsStore((s) => s.fetchAdmin);
  const approve = useReservationsStore((s) => s.approve);
  const reject = useReservationsStore((s) => s.reject);
  const cancel = useReservationsStore((s) => s.cancel);

  const equipments = useEquipmentsStore((s) => s.equipments);
  const fetchAllEquipments = useEquipmentsStore((s) => s.fetchAll);

  const [rows, setRows] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // فلاتر
  const [statusFilter, setStatusFilter] =
    useState<AdminReservation["status"] | "">("");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // مودال التعديل
  const [editing, setEditing] = useState<AdminReservation | null>(null);
  const [editStart, setEditStart] = useState<string>("");
  const [editEnd, setEditEnd] = useState<string>("");
  const [editStatus, setEditStatus] =
    useState<AdminReservation["status"]>("pending");
  const [editReason, setEditReason] = useState<string>("");

  // مودال الحذف
  const [toDelete, setToDelete] = useState<AdminReservation | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdmin(); // يرجع كل الحجوزات
        setRows(data as any);
        await fetchAllEquipments();
      } catch (e: any) {
        setError("Erreur lors du chargement des réservations.");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAdmin, fetchAllEquipments]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;

      if (equipmentFilter) {
        const eqId =
          typeof r.equipmentId === "string"
            ? r.equipmentId
            : r.equipmentId?._id;
        if (eqId !== equipmentFilter) return false;
      }

      if (userFilter) {
        const uid =
          typeof r.userId === "string" ? r.userId : r.userId?._id;
        if (uid !== userFilter) return false;
      }

      if (dateFilter) {
        const d = new Date(dateFilter);
        const start = new Date(r.start);
        if (start.toDateString() !== d.toDateString()) return false;
      }

      return true;
    });
  }, [rows, statusFilter, equipmentFilter, userFilter, dateFilter]);

  function getUserName(r: AdminReservation) {
    if (r.userId && typeof r.userId === "object") {
      return r.userId.name || r.userId.email || r.userId._id;
    }
    return r.userId;
  }

  function getEquipmentName(r: AdminReservation) {
    if (r.equipmentId && typeof r.equipmentId === "object") {
      return r.equipmentId.name || r.equipmentId._id;
    }
    return r.equipmentId;
  }

  function openEdit(r: AdminReservation) {
    setEditing(r);
    setEditStart(r.start.slice(0, 16)); // "YYYY-MM-DDTHH:mm"
    setEditEnd(r.end.slice(0, 16));
    setEditStatus(r.status);
    setEditReason(r.reason || "");
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        start: new Date(editStart).toISOString(),
        end: new Date(editEnd).toISOString(),
        status: editStatus,
        reason: editReason || undefined,
      };

      const { data } = await api.put(`/reservations/${editing._id}`, payload);

      setRows((prev) =>
        prev.map((r) => (r._id === editing._id ? (data as AdminReservation) : r))
      );
      setEditing(null);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          "Erreur lors de la mise à jour de la réservation."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteReservation() {
    if (!toDelete) return;
    setSaving(true);
    setError("");
    try {
      await api.delete(`/reservations/${toDelete._id}`);
      setRows((prev) => prev.filter((r) => r._id !== toDelete._id));
      setToDelete(null);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          "Erreur lors de la suppression de la réservation."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(id: string) {
    const updated = (await approve(id)) as any as AdminReservation;
    setRows((prev) => prev.map((r) => (r._id === id ? updated : r)));
  }

  async function handleReject(id: string) {
    const updated = (await reject(id)) as any as AdminReservation;
    setRows((prev) => prev.map((r) => (r._id === id ? updated : r)));
  }

  async function handleCancel(id: string) {
    const updated = (await cancel(id)) as any as AdminReservation;
    setRows((prev) => prev.map((r) => (r._id === id ? updated : r)));
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">Toutes les réservations</h1>
          <p className="text-gray-600 text-sm">
            Gérer, filtrer et modifier les réservations de tous les utilisateurs.
          </p>
        </div>
      </div>

      {/* فلاتر */}
      <div className="card card-pad flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AdminReservation["status"] | "")
            }
            className="input"
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvée</option>
            <option value="rejected">Rejetée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Équipement</label>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous</option>
            {equipments.map((eq) => (
              <option key={eq._id} value={eq._id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Utilisateur</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous</option>
            {/* نبني قائمة بالـ users من rows */}
            {Array.from(
              new Map(
                rows
                  .filter((r) => r.userId)
                  .map((r) => {
                    const u = r.userId;
                    const id = typeof u === "string" ? u : u._id;
                    const label =
                      typeof u === "string"
                        ? u
                        : u.name || u.email || u._id;
                    return [id, label];
                  })
              ).entries()
            ).map(([id, label]) => (
              <option key={id} value={id as string}>
                {label as string}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input"
          />
        </div>

        <button
          className="btn btn-secondary ml-auto"
          onClick={() => {
            setStatusFilter("");
            setEquipmentFilter("");
            setUserFilter("");
            setDateFilter("");
          }}
        >
          Réinitialiser
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600 text-sm">
          Aucune réservation trouvée avec ces filtres.
        </div>
      ) : (
        <div className="card card-pad overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">Utilisateur</th>
                <th className="text-left px-3 py-2">Équipement</th>
                <th className="text-left px-3 py-2">Début</th>
                <th className="text-left px-3 py-2">Fin</th>
                <th className="text-left px-3 py-2">Statut</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{getUserName(r)}</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {getEquipmentName(r)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {new Date(r.start).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {new Date(r.end).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={
                        "px-2 py-1 rounded-full text-xs font-medium " +
                        statusClass(r.status)
                      }
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-right space-x-1">
                    {r.status === "pending" && (
                      <>
                        <button
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleApprove(r._id)}
                        >
                          Approuver
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                          onClick={() => handleReject(r._id)}
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button
                        className="px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-black"
                        onClick={() => handleCancel(r._id)}
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                      onClick={() => openEdit(r)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => setToDelete(r)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال التعديل */}
      {editing && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-lg bg-white shadow-xl animate-fade">
              <h3 className="text-lg font-semibold mb-3 text-center">
                Modifier la réservation
              </h3>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Début
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Statut
                  </label>
                  <select
                    className="input"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as AdminReservation["status"]
                      )
                    }
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvée</option>
                    <option value="rejected">Rejetée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1">
                    Motif
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال الحذف */}
      {toDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setToDelete(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-md bg-white shadow-xl animate-fade">
              <h3 className="text-lg font-semibold text-center mb-2">
                Supprimer la réservation ?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setToDelete(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-danger"
                  onClick={deleteReservation}
                  disabled={saving}
                >
                  {saving ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
