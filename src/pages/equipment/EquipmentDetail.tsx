import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

import EquipmentCalendar from "../../components/EquipmentCalendar";
import { useReservationsStore } from "../../store/reservations";
import { useEquipmentsStore } from "../../store/equipments";
import { useAuthStore } from "../../store/auth";

const publicAsset = (relPath: string) =>
  `${import.meta.env.BASE_URL}${relPath.replace(/^\/+/, "")}`;

const resolveImageSrc = (eq: any): string => {
  if (!eq) return "";
  if (eq.photoUrl) return eq.photoUrl;
  if (eq.imageFile) return publicAsset(`/assets/equipments/${eq.imageFile}`);
  if (eq.id === "equip-3" || /projecteur|projector/i.test(eq.name)) {
    return publicAsset("/assets/equipments/projector.jpg");
  }
  return "https://placehold.co/600x300";
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();

  const fetchAllEquipments = useEquipmentsStore((s) => s.fetchAll);
  const getById = useEquipmentsStore((s) => s.getById);
  const equipment = id ? getById(id) : undefined;
  const allReservations = useReservationsStore((s) => s.reservations);
  const fetchCalendar = useReservationsStore((s) => s.fetchCalendar);
  const createReservation = useReservationsStore((s) => s.create);
  const cancelReservation = useReservationsStore((s) => s.cancel);
  const hasConflict = useReservationsStore((s) => s.hasConflict);

  const reservations = useMemo(() => {
    if (!id) return [];
      return allReservations
      .filter((r) => r.equipmentId?._id === id)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
  }, [allReservations, id]);

  const [lastReason, setLastReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempReason, setTempReason] = useState("");
  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedEnd, setSelectedEnd] = useState<string>("");
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
  fetchAllEquipments();
  fetchCalendar(); // ysob كل حجوزات كل المستخدمين
}, [fetchAllEquipments, fetchCalendar]);



  if (!equipment) {
    return (
      <div className="p-6 space-y-3">
        <p>Équipement introuvable.</p>
        <Link className="text-blue-600 hover:underline" to="/equipment">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const imgSrc = resolveImageSrc(equipment);

  async function confirmReservation() {
    if (!user || !selectedStart || !selectedEnd) {
      setIsModalOpen(false);
      return;
    }

    setLastReason(tempReason);

    try {
      await createReservation({
        equipmentId: equipment._id, // ✅ fixed: use backend _id
        start: new Date(selectedStart).toISOString(),
        end: new Date(selectedEnd).toISOString(),
        reason: tempReason,
      });

      setIsModalOpen(false);
      setToast({ text: "Demande envoyée avec succès !", kind: "success" });
      nav("/reservations", { replace: true });
    } catch (err: any) {
      setToast({
        text: err?.response?.data?.error || "Erreur lors de la réservation.",
        kind: "error",
      });
    }
  }

  return (
    <div className="space-y-6 animate-fade">
      <Link to="/equipment" className="text-blue-600 hover:underline">
        ← Retour
      </Link>

      <div className="card card-pad">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={equipment.name}
            className="w-64 h-64 object-cover rounded-xl mb-4"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/600x300")
            }
          />
        ) : null}

        <h1 className="text-2xl font-semibold">{equipment.name}</h1>
        <p className="text-slate-600">{equipment.description}</p>
        <p className="text-sm text-slate-500">
          Capacité: {equipment.capacity} • Localisation: {equipment.location} •
          Statut: {equipment.status}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card card-pad">
          <h2 className="font-semibold mb-3">Calendrier</h2>

          <EquipmentCalendar
            equipmentId={equipment._id}
            onSelect={(start, end) => {
              if (!user) return;

              const s = start.toISOString();
              const e = end.toISOString();

              if (hasConflict(equipment._id, s, e)) {
                setToast({
                  text: "Conflit détecté : créneau déjà occupé.",
                  kind: "error",
                });
                return;
              }

              setSelectedStart(s);
              setSelectedEnd(e);
              setTempReason(lastReason);
              setIsModalOpen(true);
            }}
          />
        </div>

        <div className="card card-pad">
          <h2 className="font-semibold mb-3">Réservations</h2>

          {reservations.length === 0 ? (
            <div className="text-slate-600">
              Aucune réservation pour cet équipement.
            </div>
          ) : (
            <ul className="space-y-2">
              {reservations.map((r) => (
                <li
                  key={r._id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(r.start).toLocaleString()} →{" "}
                      {new Date(r.end).toLocaleString()}
                    </div>
                    <div className="text-slate-500">
                      Utilisateur: {r.user?.name || "?"} • Statut: {r.status}
                    </div>
                    {r.reason && (
                      <div className="text-slate-600">Motif: {r.reason}</div>
                    )}
                  </div>
                  {r.status !== "cancelled" && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => cancelReservation(r._id)}
                    >
                      Annuler
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`fixed left-1/2 top-24 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white text-center animate-toast ${
            toast.kind === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card card-pad w-full max-w-md shadow-xl animate-fade">
              <h3 className="text-xl font-semibold text-center">
                Motif de la réservation
              </h3>
              <p className="text-gray-500 text-sm text-center mt-1 mb-4">
                (facultatif)
              </p>

              <textarea
                value={tempReason}
                onChange={(e) => setTempReason(e.target.value)}
                placeholder="Entrez le motif ici..."
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={confirmReservation}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
