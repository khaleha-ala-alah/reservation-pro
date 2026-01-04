import { useEffect, useState } from "react";
import { useEquipmentsStore } from "../../store/equipments";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

export default function EquipmentsQuantity() {
  const fetchAll = useEquipmentsStore((s) => s.fetchAll);
  const equipments = useEquipmentsStore((s) => s.equipments);

  const [editing, setEditing] = useState<any>(null);
  const [newQty, setNewQty] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ text: string; kind: string } | null>(
    null
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function openEdit(eq: any) {
    setEditing(eq);
    setNewQty(eq.quantity);
  }

  async function saveQty() {
    if (newQty < 0) {
      setToast({ text: "La quantité ne peut pas être négative.", kind: "error" });
      return;
    }

    setSaving(true);
    try {
      await api.put(`/equipments/${editing._id}`, {
        quantity: newQty,
      });

      setToast({ text: "Quantité mise à jour !", kind: "success" });
      setEditing(null);
      fetchAll();
    } catch (err: any) {
      setToast({
        text: err.response?.data?.error || "Erreur lors de la mise à jour.",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des quantités</h1>
      <p className="text-gray-600 mb-4">
        Liste complète des équipements et leurs détails, avec modification des quantités.
      </p>

      <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-left">Image</th>
              <th className="px-3 py-2 text-left">Nom</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Localisation</th>
              <th className="px-3 py-2 text-left">Capacité</th>
              <th className="px-3 py-2 text-left">Quantité</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {equipments.map((eq) => (
              <tr key={eq._id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  <img
                    src={
                      eq.photoUrl?.startsWith("http")
                        ? eq.photoUrl
                        : "https://placehold.co/80x80"
                    }
                    alt={eq.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </td>

                <td className="px-3 py-2 font-medium">{eq.name}</td>

                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      eq.status === "available"
                        ? "bg-green-100 text-green-700"
                        : eq.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {eq.status}
                  </span>
                </td>

                <td className="px-3 py-2">{eq.location || "—"}</td>

                <td className="px-3 py-2">{eq.capacity ?? "—"}</td>

                <td className="px-3 py-2 font-semibold">{eq.quantity}</td>

                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    onClick={() => openEdit(eq)}
                    className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Modifier
                  </button>

                  <Link
                    to={`/equipment/${eq._id}`}
                    className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de modification */}
      {editing && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditing(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-center mb-4">
                Modifier la quantité
              </h2>

              <p className="font-medium text-center mb-2">{editing.name}</p>

              <input
                type="number"
                className="input w-full text-center"
                value={newQty}
                min={0}
                onChange={(e) => setNewQty(Number(e.target.value))}
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={saveQty}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded text-white shadow-lg ${
            toast.kind === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
