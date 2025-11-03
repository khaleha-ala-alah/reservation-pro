import React from "react";
import { Link } from "react-router-dom";
import { useEquipmentsStore } from "../../store/equipments";


import hdmiImg from "../../assets/equipments/cablehdmi.jpg";
import rallongeImg from "../../assets/equipments/rallonge.jpg";

export default function EquipmentList() {
  const equipments = useEquipmentsStore((s) => s.equipments);
  const fetchAll = useEquipmentsStore((s) => s.fetchAll);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const equipmentImages: Record<string, string> = {
    "Câble HDMI": hdmiImg,
    "Rallonge électrique": rallongeImg,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Liste des équipements</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {equipments.length === 0 ? (
          <div className="text-gray-500">Aucun équipement trouvé.</div>
        ) : (
          equipments.map((eq) => {
            const src = equipmentImages[eq.name] || (eq as any).photoUrl || hdmiImg;

            const statusColor =
              eq.status === "available"
                ? "bg-green-500"
                : eq.status === "maintenance"
                ? "bg-yellow-500"
                : "bg-red-500";

            return (
              <Link
                key={eq.id}
                to={`/equipment/${eq.id}`}
                className="border rounded-2xl p-4 shadow-sm hover:shadow-lg transition bg-white"
              >
                <div className="flex flex-col items-center space-y-3">
                  <img
                    src={src}
                    alt={eq.name}
                    className="h-32 w-32 object-contain rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="text-center">
                    <h2 className="font-semibold text-lg">{eq.name}</h2>
                    <p className="text-gray-500 text-sm">{eq.description}</p>
                    <p className="text-gray-400 text-xs">{eq.location}</p>
                  </div>
                  <span
                    className={`text-white text-sm px-3 py-1 rounded-full ${statusColor}`}
                  >
                    {eq.status === "available"
                      ? "Disponible"
                      : eq.status === "maintenance"
                      ? "Maintenance"
                      : "Indisponible"}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
