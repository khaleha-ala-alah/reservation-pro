import { create } from "zustand";
import { api } from "../api/axios";

export type Reservation = {
  _id: string;
  equipmentId: string;
  userId: string;
  start: string; // ISO
  end: string;   // ISO
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

type NewReservation = {
  equipmentId: string;
  start: string;
  end: string;
  reason?: string;
};

type ResState = {
  reservations: Reservation[];
  fetchMine: () => Promise<void>;
  create: (payload: NewReservation) => Promise<Reservation>;
  cancel: (id: string) => Promise<Reservation>;
  approve: (id: string) => Promise<Reservation>;
  reject: (id: string) => Promise<Reservation>;
  fetchAdmin: (status?: string) => Promise<Reservation[]>;
  /** ✅ keep old UI happy; backend still enforces conflicts */
  hasConflict: (equipmentId: string, startISO: string, endISO: string) => boolean;
};

export const useReservationsStore = create<ResState>((set, get) => ({
  reservations: [],

  fetchMine: async () => {
    const { data } = await api.get("/reservations");
    set({ reservations: data });
  },

  create: async (payload) => {
    const { data } = await api.post("/reservations", payload);
    set({ reservations: [data, ...get().reservations] });
    return data;
  },

  cancel: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/cancel`);
    set({ reservations: get().reservations.map((r) => (r._id === id ? data : r)) });
    return data;
  },

  approve: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/approve`);
    set({ reservations: get().reservations.map((r) => (r._id === id ? data : r)) });
    return data;
  },

  reject: async (id) => {
    const { data } = await api.patch(`/reservations/${id}/reject`);
    set({ reservations: get().reservations.map((r) => (r._id === id ? data : r)) });
    return data;
  },

  fetchAdmin: async (status) => {
    const { data } = await api.get(`/reservations/admin${status ? `?status=${status}` : ""}`);
    return data;
  },

  /** NOTE: This checks only reservations in local store.
   * Backend will still block with 409 if another user's reservation overlaps.
   */
  hasConflict: (equipmentId, startISO, endISO) => {
    const s = new Date(startISO).getTime();
    const e = new Date(endISO).getTime();
    if (!isFinite(s) || !isFinite(e)) return false;

    return get().reservations.some((r) => {
      if (r.equipmentId !== equipmentId) return false;
      if (r.status === "cancelled" || r.status === "rejected") return false;
      const rs = new Date(r.start).getTime();
      const re = new Date(r.end).getTime();
      // overlap if (s < re) && (e > rs)
      return s < re && e > rs;
    });
  },
}));
