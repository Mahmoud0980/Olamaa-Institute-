"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import DiffRows from "./DiffRows";

const eventMeta = {
  created: {
    label: "إضافة",
    dot: "bg-blue-500",
    chip: "bg-blue-100 text-blue-700 border-blue-200",
    card: "bg-blue-50/60 border-blue-200",
  },
  updated: {
    label: "تعديل",
    dot: "bg-green-500",
    chip: "bg-green-100 text-green-700 border-green-200",
    card: "bg-green-50/60 border-green-200",
  },
  deleted: {
    label: "حذف",
    dot: "bg-red-500",
    chip: "bg-red-100 text-red-700 border-red-200",
    card: "bg-red-50/60 border-red-200",
  },
};

export default function TimelineItem({ log }) {
  const meta = eventMeta[log.event] || eventMeta.updated;
  const [open, setOpen] = useState(false);

  const modelName = useMemo(() => {
    const raw = log.auditable_type || "";
    const parts = raw.split("\\");
    return parts[parts.length - 1] || raw;
  }, [log.auditable_type]);

  return (
    <div className="relative pr-10">
      {/* Timeline dot */}
      <div
        className={`absolute right-[2px] top-4 h-3.5 w-3.5 rounded-full ${meta.dot} ring-4 ring-white`}
      />

      <div
        className={`
          rounded-2xl  shadow-sm
          ${meta.card}
          transition hover:shadow-md
        `}
      >
        {/* HEADER (compact مثل الصورة) */}
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px]  ${meta.chip}`}
              >
                {meta.label}
              </span>

              <span className="text-[12px] text-gray-600">
                بواسطة:{" "}
                <span className="font-semibold text-gray-800">
                  {log.user_name || "N/A"}
                </span>
              </span>
            </div>

            <div className="text-[12px] text-gray-500">
              {modelName} (ID: {log.auditable_id})
            </div>
          </div>

          <div className="text-[11px] text-gray-400 whitespace-nowrap">
            {dayjs(log.created_at).format("HH:mm  YYYY-MM-DD")}
          </div>
        </div>

        {/* BODY (بدون height كبير) */}
        <div className="px-4 pb-3">
          {/* عرض مختصر (اول كم سطر فقط) */}
          <DiffRows
            event={log.event}
            oldValues={log.old_values}
            newValues={log.new_values}
            compact
            limit={4}
          />

          {/* تفاصيل أكثر */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 transition"
          >
            تفاصيل أكثر
            <ChevronDown
              size={15}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="mt-2">
              <DiffRows
                event={log.event}
                oldValues={log.old_values}
                newValues={log.new_values}
                compact={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
