
export type EquipmentStatus = "available" | "maintenance" | "out";

export type Equipment = {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  location: string;
  status: EquipmentStatus;
  photoUrl?: string;
};

export type ReservationStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Reservation = {
  id: string;
  equipmentId: string;
  userId: string;
  start: string;
  end: string;
  reason?: string;
  status: ReservationStatus;
};
