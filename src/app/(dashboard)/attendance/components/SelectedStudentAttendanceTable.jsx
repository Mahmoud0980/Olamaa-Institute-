"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import DataTable from "@/components/common/DataTable";

function formatTime(val) {
  if (!val) return "-";
  const t = String(val).split(" ")[1] || "";
  if (!t) return "-";
  const [hh, mm] = t.split(":");
  return hh && mm ? `${hh}:${mm}` : t;
}

const badge = (status) => {
  switch (status) {
    case "present":
      return { text: "موجود", className: "bg-green-100 text-green-700" };
    case "late":
      return { text: "متأخر", className: "bg-orange-100 text-orange-700" };
    case "absent":
      return { text: "غائب", className: "bg-red-100 text-red-700" };
    default:
      return { text: status || "-", className: "bg-gray-100 text-gray-600" };
  }
};

export default function SelectedStudentAttendanceTable({
  student,
  records = [],
  onClose,
}) {
  const stats = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, excused: 0 };
    (records || []).forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [records]);

  const columns = useMemo(() => [
    { 
      header: "التاريخ", 
      key: "attendance_date" 
    },
    { 
      header: "التفقد", 
      key: "status", 
      className: "text-center",
      render: (val) => {
        const b = badge(val);
        return (
          <span className={`px-3 py-1 text-xs rounded-xl ${b.className}`}>
            {b.text}
          </span>
        );
      }
    },
    { 
      header: "وقت الوصول", 
      key: "recorded_at", 
      render: (val) => formatTime(val) 
    },
    { 
      header: "وقت الانصراف", 
      key: "exit_at", 
      render: (_, row) => formatTime(row.exit_at || row.exit_time || row.departure_time) 
    },
  ], []);

  if (!student) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-800">
            تفاصيل حضور الطالب: {student?.full_name || "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            موجود: {stats.present} | متأخر: {stats.late} | غائب:{" "}
            {stats.absent}{" "}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800"
          title="إغلاق"
        >
          <X size={18} />
        </button>
      </div>

      <DataTable
        data={records}
        columns={columns}
        showCheckbox={false}
        pageSize={6}
        emptyMessage="لا يوجد سجلات لهذا الطالب."
      />
    </div>
  );
}
