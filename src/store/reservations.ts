import { create } from "zustand";
import { api } from "../api/axios";
import { useEquipmentsStore } from "./equipments";

type PopulatedRef =
  | string
  | { _id?: string; id?: string; name?: string; email?: string };

export type Reservation = {
  _id: string;
  equipmentId: PopulatedRef;
  userId: PopulatedRef;
  start: string; // ISO
  end: string; // ISO
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

type NewReservation = {
  equipmentId: string;
  start: string;
  end: string;
  reason?: string;
};

function getId(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v._id || v.id || "";
}

type ResState = {
  reservations: Reservation[];

  fetchMine: () => Promise<void>;
  fetchCalendar: () => Promise<void>;

  create: (payload: NewReservation) => Promise<Reservation>;
  cancel: (id: string) => Promise<Reservation>;
  approve: (id: string) => Promise<Reservation>;
  reject: (id: string) => Promise<Reservation>;

  // ✅ NOW it also updates the store
  fetchAdmin: (status?: string) => Promise<Reservation[]>;

  hasConflict: (equipmentId: string, startISO: string, endISO: string) => boolean;
};

export const useReservationsStore = create<ResState>((set, get) => ({
  reservations: [],

  // ✅ current user's reservations only
  fetchMine: async () => {
    const { data } = await api.get("/reservations");
    set({ reservations: data });
  },

  // ✅ all reservations for calendar (all users)
  fetchCalendar: async () => {
    const { data } = await api.get("/reservations/calendar/all");
    set({ reservations: data });
  },

  create: async (payload) => {
    const { data } = await api.post("/reservations", payload);
    set({ reservations: [data, ...get().reservations] });
    return data;
  },

  cancel: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/cancel`);
    set({
      reservations: get().reservations.map((r) => (r._id === id ? data : r)),
    });
    return data;
  },

  approve: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/approve`);
    set({
      reservations: get().reservations.map((r) => (r._id === id ? data : r)),
    });
    return data;
  },

  reject: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/reject`);
    set({
      reservations: get().reservations.map((r) => (r._id === id ? data : r)),
    });
    return data;
  },

  // ✅ FIX: admin fetch should also fill store
  fetchAdmin: async (status) => {
    const { data } = await api.get(
      `/reservations/admin${status ? `?status=${status}` : ""}`
    );
    set({ reservations: data }); // ✅ THIS is the missing piece
    return data;
  },

  // ✅ local conflict check (supports populated equipmentId)
  hasConflict: (equipmentId, startISO, endISO) => {
    const s = new Date(startISO).getTime();
    const e = new Date(endISO).getTime();
    if (!isFinite(s) || !isFinite(e)) return false;

    const equipment = useEquipmentsStore.getState().getById(equipmentId);
    const qty = equipment?.quantity ?? 1;

    const overlaps = get().reservations.filter((r) => {
      const eqId = getId(r.equipmentId);
      if (String(eqId) !== String(equipmentId)) return false;

      if (r.status === "cancelled" || r.status === "rejected") return false;

      const rs = new Date(r.start).getTime();
      const re = new Date(r.end).getTime();

      return s < re && e > rs;
    });

    return overlaps.length >= qty;
  },
}));
