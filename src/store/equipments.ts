import { create } from "zustand";
import type { Equipment } from "../types";
import { MOCK_EQUIPMENTS } from "../mock/equipment";

type State = {
  equipments: Equipment[];
  fetchAll: () => void;
  setAll: (items: Equipment[]) => void;
  getById: (id: string | number) => Equipment | undefined;
};

const KEY = "equipments";

function lsGet<T>(k: string): T | null {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function lsSet(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export const useEquipmentsStore = create<State>((set, get) => ({
  equipments: lsGet<Equipment[]>(KEY) ?? [],

  fetchAll() {
    const fromLS = lsGet<Equipment[]>(KEY) ?? [];

    // Accept LS only if:
    // - projector is present,
    // - every item has a photoUrl,
    // - and printer photoUrl is not the old .png path.
    const hasProjector = fromLS.some((e) => e.id === "equip-3");
    const hasUrls = fromLS.every((e) => !!e.photoUrl);
    const printerStale = fromLS.some(
      (e) => e.name === "Imprimante 3D" && String(e.photoUrl || "").endsWith("printer.png")
    );

    if (fromLS.length > 0 && hasProjector && hasUrls && !printerStale) {
      set({ equipments: fromLS });
      return;
    }

    set({ equipments: MOCK_EQUIPMENTS });
    lsSet(KEY, MOCK_EQUIPMENTS);
  },

  setAll(items) {
    set({ equipments: items });
    lsSet(KEY, items);
  },

  getById(id) {
    return get().equipments.find((e) => String(e.id) === String(id));
  },
}));
