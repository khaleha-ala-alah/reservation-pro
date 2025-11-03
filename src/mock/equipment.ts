
import type { Equipment } from "../types";
const hdmiJpg     = new URL("../assets/equipments/cablehdmi.jpg", import.meta.url).href;
const rallongeJpg = new URL("../assets/equipments/rallonge.jpg", import.meta.url).href;
const projectorJpg  = new URL("../assets/equipments/projector.jpg", import.meta.url).href;

export const MOCK_EQUIPMENTS: Equipment[] = [
  {
    id: "equip-1",
    name: "Câble HDMI",
    description: "Câble HDMI haute vitesse (4K).",
    capacity: 1,
    location: "Stock / Armoire A",
    status: "available",
    photoUrl: hdmiJpg,
  },
  {
    id: "equip-2",
    name: "Rallonge électrique",
    description: "Rallonge 220V avec multiprise.",
    capacity: 1,
    location: "Stock / Armoire B",
    status: "maintenance",
    photoUrl: rallongeJpg,
  },
  {
    id: "equip-3",
    name: "Projecteur",
    description: "Projecteur HD pour présentations et projections.",
    capacity: 1,
    location: "Bloc C / Salle 105",
    status: "available",
    photoUrl: projectorJpg,
  },
];
