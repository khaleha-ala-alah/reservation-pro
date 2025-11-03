// src/components/EquipmentCalendar.tsx
import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";

// ✅ Types must come from @fullcalendar/core
import type { DateSelectArg, EventInput } from "@fullcalendar/core/index.js";

import { useReservationsStore } from "../store/reservations";

type Props = {
  equipmentId: string;
  onSelect?: (start: Date, end: Date) => void;
};

export default function EquipmentCalendar({ equipmentId, onSelect }: Props) {
  const all = useReservationsStore((s) => s.reservations);

  const events: EventInput[] = useMemo(
    () =>
      all
        .filter((r) => r.equipmentId === equipmentId && r.status !== "cancelled")
        .map((r) => ({
          id: r.id,
          title: r.status === "approved" ? "Réservé" : "En attente",
          start: r.start,
          end: r.end,
          color: r.status === "approved" ? "#2563eb" : "#f59e0b",
          display: "block",
        })),
    [all, equipmentId]
  );

  function handleSelect(arg: DateSelectArg) {
    if (onSelect) onSelect(arg.start, arg.end);
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      height="auto"
      expandRows
      weekends
      events={events}
      selectable
      selectMirror
      selectOverlap={false}
      longPressDelay={0}
      select={handleSelect}
      editable={false}
      eventOverlap={false}
      nowIndicator
    />
  );
}
