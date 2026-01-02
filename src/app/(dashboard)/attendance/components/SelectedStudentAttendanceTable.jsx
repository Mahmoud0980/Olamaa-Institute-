"use client";

import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";
import Pagination from "@/components/common/Pagination";

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
    case "excused":
      return { text: "إذن", className: "bg-blue-100 text-blue-700" };
    default:
      return { text: status || "-", className: "bg-gray-100 text-gray-600" };
  }
};

export default function SelectedStudentAttendanceTable({
  student,
  records = [],
  onClose,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const safe = Array.isArray(records) ? records : [];
  const totalPages = Math.ceil(safe.length / pageSize) || 1;

  const paginated = useMemo(
    () => safe.slice((page - 1) * pageSize, page * pageSize),
    [safe, page]
  );

  useEffect(() => setPage(1), [student?.id, safe.length]);

  const stats = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, excused: 0 };
    safe.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [safe]);

  if (!student) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-800">
            تفاصيل حضور الطالب: {student?.full_name || "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            موجود: {stats.present} | متأخر: {stats.late} | غائب: {stats.absent}{" "}
            | إذن: {stats.excused}
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

      {safe.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          لا يوجد سجلات لهذا الطالب.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 rounded-r-xl">#</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3 text-center">التفقد</th>
                  <th className="p-3">وقت الوصول</th>
                  <th className="p-3 rounded-l-xl">وقت الانصراف</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => {
                  const b = badge(r.status);
                  return (
                    <tr
                      key={r.id}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 rounded-r-xl">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td className="p-3">{r.attendance_date || "-"}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-xl ${b.className}`}
                        >
                          {b.text}
                        </span>
                      </td>
                      <td className="p-3">{formatTime(r.recorded_at)}</td>
                      <td className="p-3 rounded-l-xl">
                        {formatTime(
                          r.exit_at || r.exit_time || r.departure_time
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {paginated.map((r, i) => {
              const b = badge(r.status);
              return (
                <div
                  key={r.id}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">#</span>
                    <span className="font-semibold">
                      {(page - 1) * pageSize + i + 1}
                    </span>
                  </div>
                  <Row label="التاريخ" value={r.attendance_date || "-"} />
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">التفقد:</span>
                    <span
                      className={`px-3 py-1 text-xs rounded-xl ${b.className}`}
                    >
                      {b.text}
                    </span>
                  </div>
                  <Row label="وقت الوصول" value={formatTime(r.recorded_at)} />
                  <Row
                    label="وقت الانصراف"
                    value={formatTime(
                      r.exit_at || r.exit_time || r.departure_time
                    )}
                  />
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
