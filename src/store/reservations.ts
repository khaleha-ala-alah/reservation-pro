// src/store/reservations.ts
import { create } from "zustand";
import type { Reservation } from "../types";

type Status = "pending" | "approved" | "rejected" | "cancelled";

type NewReservation = {
  equipmentId: string;
  userId: string;
  start: string; // ISO
  end: string;   // ISO
  reason?: string;
};

type State = {
  reservations: Reservation[];

  // CRUD-ish
  create: (data: NewReservation) => void;
  cancel: (id: string) => void;
  approve: (id: string) => void;
  reject: (id: string) => void;

  // NEW: admin bulk action
  clearAll: () => void;

  // Used by EquipmentDetail on calendar selection
  hasConflict: (equipmentId: string, startISO: string, endISO: string) => boolean;

  // Optional helpers
  listPending: () => Reservation[];
  listByUser: (userId: string) => Reservation[];
  listByEquipment: (equipmentId: string) => Reservation[];
};

// ---- localStorage helpers
function lsGet<T>(k: string): T | null {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function lsSet(k: string, v: any) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

const KEY = "reservations";

export const useReservationsStore = create<State>((set, get) => ({
  reservations: lsGet<Reservation[]>(KEY) ?? [],

  create(data) {
    const newItem: Reservation = {
      id: (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now()),
      equipmentId: data.equipmentId,
      userId: data.userId,
      start: data.start,
      end: data.end,
      status: "pending",
      reason: data.reason,
    };
    const next = [...get().reservations, newItem];
    set({ reservations: next });
    lsSet(KEY, next);
  },

  cancel(id) {
    const next = get().reservations.map((r) =>
      r.id === id ? { ...r, status: "cancelled" } : r
    );
    set({ reservations: next });
    lsSet(KEY, next);
  },

  approve(id) {
    const next = get().reservations.map((r) =>
      r.id === id ? { ...r, status: "approved" } : r
    );
    set({ reservations: next });
    lsSet(KEY, next);
  },

  reject(id) {
    const next = get().reservations.map((r) =>
      r.id === id ? { ...r, status: "rejected" } : r
    );
    set({ reservations: next });
    lsSet(KEY, next);
  },

 
  hasConflict(equipmentId, startISO, endISO) {
    const sNew = new Date(startISO).getTime();
    const eNew = new Date(endISO).getTime();
    return get().reservations.some((r) => {
      if (r.equipmentId !== equipmentId || r.status === "cancelled") return false;
      const s = new Date(r.start).getTime();
      const e = new Date(r.end).getTime();
      
      return sNew < e && eNew > s;
    });
  },


  listPending() {
    return get().reservations.filter((r) => r.status === "pending");
  },
  listByUser(userId) {
    return get().reservations.filter((r) => r.userId === userId);
  },
  listByEquipment(equipmentId) {
    return get().reservations.filter((r) => r.equipmentId === equipmentId);
  },


  clearAll() {
    set({ reservations: [] });
    lsSet(KEY, []);
  },
}));
