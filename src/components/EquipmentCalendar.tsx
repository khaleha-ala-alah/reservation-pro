// src/components/EquipmentCalendar.tsx
import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DateSelectArg } from "@fullcalendar/core";

import { useReservationsStore } from "../store/reservations";

type Props = {
  equipmentId: string;
  onSelect?: (start: Date, end: Date) => void;
};

function getEqId(equipmentId: any): string | null {
  if (!equipmentId) return null;
  if (typeof equipmentId === "string") return equipmentId;
  if (typeof equipmentId === "object" && equipmentId._id) return String(equipmentId._id);
  return null;
}

function isAllDayLike(start: Date, end: Date) {
  // allDay إذا يبدأ 00:00 وينتهي قريب لآخر اليوم
  const sMidnight = start.getHours() === 0 && start.getMinutes() === 0;
  const eEndish =
    (end.getHours() === 23 && end.getMinutes() >= 0) ||
    (end.getHours() === 0 && end.getMinutes() === 0);
  return sMidnight && eEndish;
}

export default function EquipmentCalendar({ equipmentId, onSelect }: Props) {
  const all = useReservationsStore((s) => s.reservations);

  const events: EventInput[] = useMemo(() => {
    const now = new Date();

    return all
      .filter((r: any) => {
        const eqId = getEqId(r.equipmentId);
        if (eqId !== equipmentId) return false;

        // نخفي cancelled/rejected من التقويم (اختياري)
        if (r.status === "cancelled" || r.status === "rejected") return false;

        // ✅ Auto-hide past reservations
        const end = new Date(r.end);
        if (end < now) return false;

        return true;
      })
      .map((r: any) => {
        const start = new Date(r.start);
        const end = new Date(r.end);

        const color =
          r.status === "approved"
            ? "#2563eb" // blue
            : r.status === "pending"
            ? "#f59e0b" // amber
            : "#9ca3af"; // gray

        const title =
          r.status === "approved"
            ? "Réservé"
            : r.status === "pending"
            ? "En attente"
            : "Réservation";

        return {
          id: r._id,
          title,
          start,
          end,
          allDay: isAllDayLike(start, end),
          display: "block",
          backgroundColor: color,
          borderColor: color,
        } as EventInput;
      });
  }, [all, equipmentId]);

  function handleSelect(arg: DateSelectArg) {
    if (!onSelect) return;

    // ✅ هنا يمكن نمنع user يختار خارج ساعات العمل (احتياط)
    onSelect(arg.start, arg.end);
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

      // ✅ ساعات العمل
      slotMinTime="08:30:00"
      slotMaxTime="18:00:00"

      // ✅ مدة كل seance
      slotDuration="01:35:00"

      // ✅ إخفاء الأحد
      hiddenDays={[0]} // 0 = Sunday

      // ✅ Business hours: Monday -> Saturday
      businessHours={{
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: "08:30",
        endTime: "18:00",
      }}

      height="auto"
      expandRows
      weekends={true}

      selectable={!!onSelect}
      selectMirror
      longPressDelay={0}
      select={handleSelect}

      editable={false}

      // ✅ FullCalendar “overlap” settings (UI only)
      eventOverlap={true}
      selectOverlap={true}

      nowIndicator

      events={events}

      // ✅ عرض الوقت بشكل واضح (08:30)
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }}

      // ✅ Format labels في اليسار
      slotLabelFormat={{
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }}
    />
  );
}
