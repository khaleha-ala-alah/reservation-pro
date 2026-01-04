import { create } from "zustand";
import { api } from "../api/axios";

export type Equipment = {
  _id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  status: "available" | "maintenance" | "out";
  photoUrl?: string;
};

type EqState = {
  equipments: Equipment[];
  fetchAll: () => Promise<void>;
  create: (payload: Partial<Equipment>) => Promise<Equipment>;
  update: (id: string, payload: Partial<Equipment>) => Promise<Equipment>;
  remove: (id: string) => Promise<void>;
  /** ✅ added so EquipmentDetail can use it */
  getById: (id: string) => Equipment | undefined;
};

export const useEquipmentsStore = create<EqState>((set, get) => ({
  equipments: [],

  fetchAll: async () => {
    const { data } = await api.get("/equipments");
    set({ equipments: data });
  },

  create: async (payload) => {
    const { data } = await api.post("/equipments", payload);
    set({ equipments: [data, ...get().equipments] });
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/equipments/${id}`, payload);
    set({ equipments: get().equipments.map((e) => (e._id === id ? data : e)) });
    return data;
  },

  remove: async (id) => {
    await api.delete(`/equipments/${id}`);
    set({ equipments: get().equipments.filter((e) => e._id !== id) });
  },

  /** ✅ simple selector used by EquipmentDetail */
  getById: (id) => get().equipments.find((e) => e._id === id),
}));

export default useEquipmentsStore;
