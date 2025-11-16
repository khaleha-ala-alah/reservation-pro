import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEquipmentsStore, type Equipment } from "../../store/equipments";
import { useAuthStore } from "../../store/auth";

type EqForm = {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  status: "available" | "maintenance" | "out";
  photoUrl?: string;
};

function statusClasses(s: Equipment["status"]) {
  if (s === "available") return "bg-green-100 text-green-700";
  if (s === "maintenance") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

// Small helper for consistent buttons
const BTN =
  "px-3 py-2 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";
const BTN_PRIMARY = `${BTN} bg-blue-600 text-white hover:bg-blue-700`;
const BTN_SECONDARY = `${BTN} border text-amber-700 border-amber-300 hover:bg-amber-50`;
const BTN_DANGER = `${BTN} border text-red-700 border-red-300 hover:bg-red-50`;

export default function EquipmentList() {
  const equipments = useEquipmentsStore((s) => s.equipments);
  const fetchAll = useEquipmentsStore((s) => s.fetchAll);
  const createEq = useEquipmentsStore((s) => s.create);
  const updateEq = useEquipmentsStore((s) => s.update);
  const removeEq = useEquipmentsStore((s) => s.remove);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------- Add Modal ----------
  const [addOpen, setAddOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState<EqForm>({
    name: "",
    description: "",
    capacity: 1,
    location: "",
    status: "available",
    photoUrl: "https://placehold.co/600x300",
  });

  // ---------- Edit Modal ----------
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [editForm, setEditForm] = useState<EqForm>({
    name: "",
    description: "",
    capacity: 1,
    location: "",
    status: "available",
    photoUrl: "https://placehold.co/600x300",
  });

  function openEdit(eq: Equipment) {
    setEditing(eq);
    setEditForm({
      name: eq.name,
      description: eq.description,
      capacity: eq.capacity,
      location: eq.location,
      status: eq.status,
      photoUrl: eq.photoUrl,
    });
    setEditError("");
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
  }

  // ---------- Delete Modal (nice UI instead of window.confirm) ----------
  const [delOpen, setDelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState("");
  const [toDelete, setToDelete] = useState<Equipment | null>(null);

  function openDelete(eq: Equipment) {
    setToDelete(eq);
    setDelError("");
    setDelOpen(true);
  }
  function closeDelete() {
    setDelOpen(false);
    setToDelete(null);
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with admin action */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Catalogue des équipements</h1>
          <p className="text-gray-600">
            Liste des équipements disponibles, maintenance ou hors service.
          </p>
        </div>
        {user?.role === "admin" && (
          <button className={BTN_PRIMARY} onClick={() => setAddOpen(true)}>
            + Nouvel équipement
          </button>
        )}
      </div>

      {/* Grid first */}
      {equipments.length === 0 ? (
        <div className="text-gray-600">Aucun équipement pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {equipments.map((e) => (
            <div
              key={e._id}
              className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="relative">
                <img
                  src={
                    e.photoUrl?.startsWith("http")
                      ? e.photoUrl
                      : "https://placehold.co/600x300"
                  }
                  alt={e.name}
                  className="h-44 w-full object-cover"
                  onError={(ev) =>
                    ((ev.target as HTMLImageElement).src =
                      "https://placehold.co/600x300")
                  }
                />
                <span
                  className={
                    "absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium " +
                    statusClasses(e.status)
                  }
                >
                  {e.status}
                </span>
              </div>

              <div className="p-4">
                <h2 className="text-base font-semibold line-clamp-1">
                  {e.name}
                </h2>
                {e.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {e.description}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>📍 {e.location || "—"}</span>
                  <span>👥 {e.capacity ?? "—"}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {/* uniform-sized buttons now */}
                  <Link to={`/equipment/${e._id}`} className={BTN_PRIMARY}>
                    Voir & Réserver
                  </Link>

                  {user?.role === "admin" && (
                    <>
                      <button
                        className={BTN_SECONDARY}
                        onClick={() => openEdit(e)}
                        title="Éditer"
                      >
                        Éditer
                      </button>
                      <button
                        className={BTN_DANGER}
                        onClick={() => openDelete(e)}
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Add Modal ---------- */}
      {addOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAddOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-xl bg-white shadow-xl animate-fade">
              <h3 className="text-xl font-semibold text-center mb-3">
                Ajouter un équipement
              </h3>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Nom"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
                <input
                  className="input"
                  placeholder="Localisation"
                  value={addForm.location || ""}
                  onChange={(e) =>
                    setAddForm({ ...addForm, location: e.target.value })
                  }
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Capacité"
                  value={addForm.capacity ?? ""}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      capacity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
                <select
                  className="input"
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      status: e.target.value as EqForm["status"],
                    })
                  }
                >
                  <option value="available">Disponible</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out">Hors service</option>
                </select>
                <input
                  className="input md:col-span-2"
                  placeholder="URL de la photo"
                  value={addForm.photoUrl || ""}
                  onChange={(e) =>
                    setAddForm({ ...addForm, photoUrl: e.target.value })
                  }
                />
                <textarea
                  className="input md:col-span-2"
                  placeholder="Description"
                  rows={3}
                  value={addForm.description || ""}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                />
              </div>

              {addError && (
                <div className="text-red-600 text-sm mt-2">{addError}</div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setAddOpen(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  disabled={savingAdd || !addForm.name.trim()}
                  onClick={async () => {
                    setAddError("");
                    try {
                      setSavingAdd(true);
                      await createEq({
                        name: addForm.name.trim(),
                        description: addForm.description || undefined,
                        capacity: addForm.capacity,
                        location: addForm.location || undefined,
                        status: addForm.status,
                        photoUrl: addForm.photoUrl || undefined,
                      });
                      setAddOpen(false);
                      setAddForm({
                        name: "",
                        description: "",
                        capacity: 1,
                        location: "",
                        status: "available",
                        photoUrl: "https://placehold.co/600x300",
                      });
                    } catch (err: any) {
                      setAddError(
                        err?.response?.data?.error || "Échec de l’ajout."
                      );
                    } finally {
                      setSavingAdd(false);
                    }
                  }}
                >
                  {savingAdd ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Modal ---------- */}
      {editOpen && editing && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeEdit}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-xl bg-white shadow-xl animate-fade">
              <h3 className="text-xl font-semibold text-center mb-3">
                Éditer l’équipement
              </h3>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Nom"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <input
                  className="input"
                  placeholder="Localisation"
                  value={editForm.location || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Capacité"
                  value={editForm.capacity ?? ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      capacity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as EqForm["status"],
                    })
                  }
                >
                  <option value="available">Disponible</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out">Hors service</option>
                </select>
                <input
                  className="input md:col-span-2"
                  placeholder="URL de la photo"
                  value={editForm.photoUrl || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, photoUrl: e.target.value })
                  }
                />
                <textarea
                  className="input md:col-span-2"
                  placeholder="Description"
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              {editError && (
                <div className="text-red-600 text-sm mt-2">{editError}</div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={closeEdit}>
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  disabled={savingEdit || !editForm.name.trim()}
                  onClick={async () => {
                    if (!editing) return;
                    setSavingEdit(true);
                    setEditError("");
                    try {
                      await updateEq(editing._id, {
                        name: editForm.name.trim(),
                        description: editForm.description || undefined,
                        capacity: editForm.capacity,
                        location: editForm.location || undefined,
                        status: editForm.status,
                        photoUrl: editForm.photoUrl || undefined,
                      });
                      closeEdit();
                    } catch (err: any) {
                      setEditError(
                        err?.response?.data?.error ||
                          "Échec de la mise à jour."
                      );
                    } finally {
                      setSavingEdit(false);
                    }
                  }}
                >
                  {savingEdit ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete Modal ---------- */}
      {delOpen && toDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDelete}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-md bg-white shadow-xl animate-fade">
              <h3 className="text-xl font-semibold text-center">
                Supprimer l’équipement ?
              </h3>
              <p className="text-gray-600 text-center mt-2">
                “<span className="font-medium">{toDelete.name}</span>” sera
                définitivement supprimé. Cette action est irréversible.
              </p>

              {delError && (
                <div className="text-red-600 text-sm text-center mt-3">
                  {delError}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={closeDelete}>
                  Annuler
                </button>
                <button
                  className={BTN_DANGER}
                  disabled={deleting}
                  onClick={async () => {
                    if (!toDelete) return;
                    setDelError("");
                    try {
                      setDeleting(true);
                      await removeEq(toDelete._id);
                      closeDelete();
                    } catch (err: any) {
                      setDelError(
                        err?.response?.data?.error ||
                          "Échec de la suppression."
                      );
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
